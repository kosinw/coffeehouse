import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";
import ReactPlayer from 'react-player/youtube';
import ReactAudioPlayer from 'react-audio-player';

const Container = styled.div`
    padding: 20px;
    display: flex;
    height: 100vh;
    width: 90%;
    margin: auto;
    flex-wrap: wrap;
`;

const StyledVideo = styled.video`
    height: 40%;
    width: 50%;
    pointer-events: none;
`;

function Item(props) {
    return <li>{props.message}</li>;
}

const Video = (props) => {
    const ref = useRef();

    useEffect(() => {
        props.peer.on("stream", stream => {
            ref.current.srcObject = stream;
        })
    }, []);

    return (
        <StyledVideo muted={false} playsInline autoPlay ref={ref} />
    );
}

const videoConstraints = {
    height: window.innerHeight / 2,
    width: window.innerWidth / 2
};

const Message = (props) => {
    //sender: person who sent it
    //text: message body
    //isYou: whether you sent it
    const msgData = props;
    console.log(msgData);
    return { text: msgData.sender + ": " + msgData.message };
    //return <h1>{msgData.sender}: {msgData.text}</h1>
}

const Room = (props) => {
    const [peers, setPeers] = useState([]);
    const [chat, setChat] = useState([{}]);
    const socketRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);
    const audioRef = useRef();
    const roomID = props.match.params.roomID;
    const [uri, setUri] = useState(null);
    const [playerRunning, setPlaying] = useState(true);
    const [playerVol, setVol] = useState(1);
    const songqueue = [];
    let songplaying = false;
    let startPlayingSong = 0;
    let deafened = false;

    function songEnded() {
        if (songqueue.length > 0) {
            playSong(songqueue[0], 0);
            setPlaying(true);
        }
        else {
            setPlaying(false);
            songplaying = false;
        }
    }

    function playSong(url, time) {
        startPlayingSong = time;
        setUri(url);
    }

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
        if (message == "-skip") {
            songEnded();
        }
        else if (message.substring(0, 6) == "-play ") {
            socketRef.current.emit("getLink", message.substring(6));
        }
        else if (message.substring(0, 7) == "-queue ") {
            socketRef.current.emit("getLink", message.substring(7));
        }
        else if (message == "-help") {
            console.dir("List of Commands:");
            console.dir("-play [song title]");
            console.dir("-queue [song title]");
            console.dir("-skip");
        }
        //send message
        socketRef.current.emit("sending message", message);
        setChat(chat => [...chat, Message({
            sender: "You",
            message: message,
            isYou: true
        })]);
    }
    function ChatType() {
        let formData = { message: "" };
        const handleChange = (e) => {
            formData.message = e.target.value.trim();
        };
        const afterSubmission = e => {
            e.preventDefault();
            sendMessage(formData.message);
            document.getElementById("chatEnter").reset();
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

    function SearchButton() {
        const startSong = () => {
            setTimeout(function () {
                songplaying = true;
                setPlaying(true);
                songqueue.shift();
            }, Math.max(startPlayingSong - Date.now(), 0));
        }

        return (
            <div>
                <ReactPlayer
                    url={uri}
                    volume={playerVol}
                    playing={playerRunning}
                    height='0px'
                    width='0px'
                    onReady={() => startSong()}
                    onEnded={() => songEnded()}
                />
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

            socketRef.current.on("link", payload => {
                const data = JSON.parse(payload);
                songqueue.push(data.url);
                if (songqueue.length == 1) playSong(data.url, data.time);
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
            <SearchButton />
            {peers.map((peer, index) => {
                return (
                    <Video key={index} peer={peer} />
                );
            })}
        </Container>
    );
};

export default Room;
