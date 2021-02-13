import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";
import ReactPlayer from 'react-player';

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
    const roomID = props.match.params.roomID;

    let deafened = false;
    let songqueue = [];
    let songplaying = false;

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
        socketRef.current.emit("sending message", message);
        setChat([...chat, Message({
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
        const [uri, setUri] = useState(null);

        const songEnded = () => {
            songplaying = false;

            console.dir(songqueue.length)

            if (songqueue.length > 0) {
                songplaying = true;
                var search = require('youtube-search');

                var opts = {
                    maxResults: 20,
                    key: 'AIzaSyCo4wVmAsuOeg4rxT6sgZgcsfDVic6nCes'
                };

                search(songqueue[0], opts, function (err, results) {
                    if (err) return console.log(err);
                    let i;
                    for (i = 0; i < results.length; i++) {
                        if (results[i].kind == 'youtube#video') {
                            setUri(results[i].link)
                            console.dir(results[i].link);
                            songqueue.shift()
                            break;
                        }
                    }
                });
            }
            else {
                console.dir("no more songs queued");
            }
        }

        const setVideo = () => {
            let videoquery = document.getElementById('video-query').value

            if (videoquery == "-skip") {
                songEnded()
            }
            else if (videoquery.substring(0, 6) == "-play ") {
                songplaying = true;
                var search = require('youtube-search');

                var opts = {
                    maxResults: 20,
                    key: 'AIzaSyCo4wVmAsuOeg4rxT6sgZgcsfDVic6nCes'
                };

                search(videoquery.substring(6), opts, function (err, results) {
                    if (err) return console.log(err);
                    let i;
                    for (i = 0; i < results.length; i++) {
                        if (results[i].kind == 'youtube#video') {
                            setUri(results[i].link)
                            console.dir(results[i].link);
                            break;
                        }
                    }
                });
            }
            else if (videoquery.substring(0, 7) == "-queue ") {
                console.dir(videoquery.substring(7));

                if (!songplaying) {
                    songplaying = true;
                    var search = require('youtube-search');
    
                    var opts = {
                        maxResults: 20,
                        key: 'AIzaSyCo4wVmAsuOeg4rxT6sgZgcsfDVic6nCes'
                    };
    
                    search(videoquery.substring(7), opts, function (err, results) {
                        if (err) return console.log(err);
                        let i;
                        for (i = 0; i < results.length; i++) {
                            if (results[i].kind == 'youtube#video') {
                                setUri(results[i].link)
                                console.dir(results[i].link);
                                break;
                            }
                        }
                    });
                }
                else {
                    songqueue.push(videoquery);
                    console.dir("this ran");
                    console.dir(songqueue);
                }
            }
            else if (videoquery == "-help") {
                console.dir("List of Commands:");
                console.dir("-play [song title]");
                console.dir("-queue [song title]");
                console.dir("-skip");
            }
            else {
                console.dir("this is literally just to be treated as normal text");
            }
        };

        return (
            <div>
                <button onClick={() => setVideo()}>search youtube</button>
                <input id='video-query' class="w3-input" type="text" placeholder="big chungus"></input>
                <ReactPlayer 
                    url={uri}
                    playing = 'true'
                    height = '0px'
                    width = '0px'
                    onEnded = {() => songEnded()}
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

            socketRef.current.on("receiving message", messageData => {
                const data = JSON.parse(messageData);
                setChat([...chat, Message({
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
            <StyledVideo muted ref={userVideo} autoPlay playsInline />
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
