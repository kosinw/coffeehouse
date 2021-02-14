/** @jsx jsx */
import { jsx } from '@emotion/react'
import tw, { styled, css } from 'twin.macro';
import PeerVideo from "components/MainContent/PeerVideo";
import LocalVideo from "components/MainContent/LocalVideo";
import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import io from "socket.io-client";
import { useParams } from "react-router-dom";
import getGridLayout, { getNumColumns, getNumRows } from "utils/getGridLayout";
import { useParticipants } from "hooks/participants";
import { useVideoBot } from "hooks/video-bot";
import { useAuth } from "hooks/firebase";

const gridAreas = "ABCDEFGHIJ".split("");

const Grid = styled.div(({ num = 1 }) => [
    tw`grid h-full w-full`,
    css`grid-template-rows: repeat(${getNumRows(num)}, calc(${100 / getNumRows(num)}vh));`,
    css`grid-template-columns: repeat(${getNumColumns(num)}, 1fr);`,
    css`grid-template-areas: ${getGridLayout(num)};`
]);

const videoConstraints = {
    height: 720,
    width: 1280,
    frameRate: 30
};

const constraints = {
    video: videoConstraints,
    audio: true
}

function VideoGrid({ userVideo }) {
    const [chat, setChat] = useState([{}]);
    const [peers, setPeers] = useState([]);
    const socketRef = useRef();
    const [socketInitialized, setSocketInitialized] = useState(false);
    const peersRef = useRef([]);
    const { roomID } = useParams();
    const { participants, updateParticipants } = useParticipants();
    const { playSong, songEnded, queueSong, songqueue } = useVideoBot();
    const { user, reloadUser } = useAuth();

    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        if (!!user && !!user.displayName && socketInitialized && authLoading) {            
            const payload = JSON.stringify({
                userID: user.uid,
                roomID,
                photoURL: user.photoURL,
                displayName: user.displayName
            });

            socketRef.current.emit("auth/user/join", payload);

            socketRef.current.on("auth/user/currentUsers", users => {
                console.log(users);
                updateParticipants(users.map(JSON.parse));
            })

            setAuthLoading(false);
        }
    });

    useEffect(() => {
        socketRef.current = io.connect(process.env.REACT_APP_HOST_SERVER || "24.205.76.29:64198");
        setSocketInitialized(true);

        navigator.mediaDevices.getUserMedia(constraints).then(stream => {
            userVideo.current.srcObject = stream;
            socketRef.current.emit("join room", roomID);
            socketRef.current.on("all users", users => {
                const peers = [];
                users.forEach(userID => {
                    const peer = createPeer(userID, socketRef.current.id, stream);
                    peersRef.current.push({
                        peerID: userID,
                        peer
                    })
                    peers.push({
                        peerID: userID,
                        peer
                    });
                });
                setPeers(peers);

            });

            socketRef.current.on("user joined", payload => {
                const peer = addPeer(payload.signal, payload.callerID, stream);

                peersRef.current.push({
                    peerID: payload.callerID,
                    peer,
                });

                const peerObj = {
                    peer,
                    peerID: payload.callerID
                }

                setPeers(users => [...users, peerObj])
            });

            socketRef.current.on("receiving returned signal", payload => {
                const item = peersRef.current.find(p => p.peerID === payload.id);
                item.peer.signal(payload.signal);
            })

            socketRef.current.on("user left", id => {
                const peerObj = peersRef.current.find(p => p.peerID === id);
                if (peerObj) {
                    peerObj.peer.destroy();
                }
                const peers = peersRef.current.filter(p => p.peerID !== id);
                peersRef.current = peers;
                setPeers(peers);
            })

            socketRef.current.on("linkFirst", payload => {
                const data = JSON.parse(payload);
                songqueue.current.splice(0, 0, data.url);
                playSong(data.url, data.time);
            });
            socketRef.current.on("linkEnd", payload => {
                const data = JSON.parse(payload);
                queueSong(data.url);
                if (songqueue.current.length == 1) playSong(data.url, data.time);
            });

            socketRef.current.on("skip", time => {
                songEnded(time);
            });

            socketRef.current.on("receiving message", messageData => {
                const data = JSON.parse(messageData);
                setChat(chat => [...chat, Message({
                    sender: data.sender,
                    message: data.message,
                    isYou: false
                })]);
            });

        }).catch(err => {
            console.log(err)
        });

    }, []);

    function Message({ sender, message }) {
        return { text: sender + ": " + message };
    }

    function sendMessage(message) {
        if (message == "-help") {
            setChat(chat => [...chat, Message({
                sender: "List of Commands",
                message: "-play [song title]\n-play [song title]\n-queue [song title]\n-skip",
                isYou: false
            })]);
        }
        else {
            if (message == "-skip") {
                socketRef.current.emit("skip", 0);
            }
            else if (message.toLowerCase().substring(0, 6) == "-play ") {
                if (message.substring(6) != "") socketRef.current.emit("getLink", JSON.stringify({
                    search: message.substring(6),
                    type: "linkFirst"
                }));
            }
            else if (message.toLowerCase().substring(0, 7) == "-queue ") {
                if (message.substring(7) != "") socketRef.current.emit("getLink", JSON.stringify({
                    search: message.substring(6),
                    type: "linkEnd"
                }));
            }
            //send message
            socketRef.current.emit("sending message", message);
            setChat(chat => [...chat, Message({
                sender: "You",
                message: message,
                isYou: true
            })]);
        }
    }

    // TODO(kosi): This is temporary chat ui for functionality
    function ChatType() {
        let formData = { message: "" };
        const handleChange = (e) => {
            formData.message = e.target.value.trim();
        };
        const afterSubmission = e => {
            e.preventDefault();
            sendMessage(formData.message);
        }

        return (
            <form id="chatEnter" onSubmit={afterSubmission}>
                <input type="text" onChange={handleChange} placeholder="Enter message"></input>
            </form>
        );
    }


    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            socketRef.current.emit("sending signal", { userToSignal, callerID, signal })
        })

        return peer;
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        })

        peer.on("signal", signal => {
            socketRef.current.emit("returning signal", { signal, callerID })
        })

        peer.signal(incomingSignal);

        return peer;
    }


    // useEffect(() => {
    //     updateParticipants(peersRef.current);
    // }, [peers]);

    return (
        <>
            <>
                <ChatType />
                <div tw="text-white">
                    {chat.map((person, index) => (
                        <p key={index}>{person.text}</p>
                    ))}
                </div>
            </>
            <Grid num={peersRef.current.length + 1}>
                <LocalVideo ref={userVideo} />
                {peersRef.current.map((peer, index) =>
                    <PeerVideo peer={peer.peer}
                        key={`${peer.peerID}${index}`}
                        grid={gridAreas[index + 1]}
                    />
                )}
            </Grid>
        </>
    );
}

export default VideoGrid;