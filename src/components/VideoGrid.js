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

const gridAreas = "ABCDEFGHIJ".split("");

const Room = (props) => {
    const [peers, setPeers] = useState([]);
    const [chat, setChat] = useState([{}]);
    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);
    const { roomID } = useParams();
    let deafened = false;
    const { playSong, songEnded, queueSong, songqueue } = useVideoBot();

    //setInterval(() => {
    //    console.log(songqueue);
    //}, 1000);

    function MuteButton() {
        const [text, setText] = useState("Mute");

        const setMic = () => {
            if (userVideo.current.srcObject.getAudioTracks()[0].enabled) {
                setText("Unmute");
                userVideo.current.srcObject.getAudioTracks()[0].enabled = false;
            } else {
                setText("Mute");
                userVideo.current.srcObject.getAudioTracks()[0].enabled = true;
            }
        };

        return (
            <div>
                <button onClick={() => setMic()}>
                    {text}
                </button>
            </div>
        );
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
                socketRef.current.emit("skip",0);
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

    function VideoButton() {
        const [text, setText] = useState("Turn off Video");

        const setVideo = () => {
            if (userVideo.current.srcObject.getVideoTracks()[0].enabled) {
                setText("Turn on Video");
                userVideo.current.srcObject.getVideoTracks()[0].enabled = false;
            } else {
                setText("Turn off Video");
                userVideo.current.srcObject.getVideoTracks()[0].enabled = true;
            }
        };

        return (
            <div>
                <button onClick={() => setVideo()}>
                    {text}
                </button>
            </div>
        );
    }

    function deafenMe(elem) {
        elem.muted = true;
    }

    function undeafenMe(elem) {
        elem.muted = false;
    }

    function DeafenButton() {
        const [text, setText] = useState("Deafen");

        const setAudio = () => {
            if (!deafened) {
                setText("Undeafen");
                deafened = true;
                var elems = document.querySelectorAll("video, audio");
                [].forEach.call(elems, function (elem) { deafenMe(elem); });
            } else {
                setText("Deafen");
                deafened = false;
                var elems = document.querySelectorAll("video, audio");
                [].forEach.call(elems, function (elem) { undeafenMe(elem); });
            }
        };

        return (
            <div>
                <button onClick={() => setAudio()}>
                    {text}
                </button>
            </div>
        );
    }

    useEffect(() => {
        socketRef.current = io.connect("24.205.76.29:64198");
        navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true }).then(stream => {
            userVideo.current.srcObject = stream;
            socketRef.current.emit("join room", roomID);
            socketRef.current.on("all users", users => {
                const peers = [];
                users.forEach(userID => {
                    const peer = createPeer(userID, socketRef.current.id, stream);
                    peersRef.current.push({
                        peerID: userID,
                        peer,
                    })
                    peers.push(peer);
                })
                setPeers(peers);
            })

            socketRef.current.on("user joined", payload => {
                const peer = addPeer(payload.signal, payload.callerID, stream);
                peersRef.current.push({
                    peerID: payload.callerID,
                    peer,
                })

                setPeers(users => [...users, peer]);
            });

            socketRef.current.on("receiving returned signal", payload => {
                const item = peersRef.current.find(p => p.peerID === payload.id);
                item.peer.signal(payload.signal);
            });

            socketRef.current.on("linkFirst", payload => {
                const data = JSON.parse(payload);
                songqueue.current.splice(0,0,data.url);
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
        })
    }, []);

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

    return (
        <Container>
            <StyledVideo muted ref={userVideo} vol autoPlay playsInline />
            <MuteButton />
            <ChatType />
            <div>
                {chat.map((person, index) => (
                    <p key={index}>{person.text}</p>
                ))}
            </div>
            <DeafenButton />
            <VideoButton />
            {peers.map((peer, index) => {
                return (
                    <Video key={index} peer={peer} />
                );
            })}
        </Container>
    );
};