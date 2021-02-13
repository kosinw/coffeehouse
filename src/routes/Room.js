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

const Room = (props) => {
    const [peers, setPeers] = useState([]);
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
        }

        const setVideo = () => {

            let videoquery = document.getElementById('video-query').value

            if (!songplaying) {
                songplaying = true;
                var search = require('youtube-search');

                var opts = {
                    maxResults: 20,
                    key: 'AIzaSyCo4wVmAsuOeg4rxT6sgZgcsfDVic6nCes'
                };

                search(videoquery, opts, function (err, results) {
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
                console.dir(songqueue);
            }
        };

        return (
            <div>
                <button onClick={() => setVideo()}>search youtube</button>
                <input id='video-query' class="w3-input" type="text" placeholder="big chungus"></input>
                <ReactPlayer 
                    url={uri}
                    playing = 'true'
                    height = '300px'
                    width = '300px'
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
