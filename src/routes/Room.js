import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";
import ReactPlayer from 'react-player';
import * as Tone from 'tone'

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

let soundList = [];
let trackList = [];

let trackplaying = true;

let start = Date.now();
let currentTime = 0;
let progresslength = 0;

// all the synths
const defaultSynth = new Tone.Synth().toDestination();
const fmSynth = new Tone.FMSynth().toDestination();
const amSynth = new Tone.AMSynth().toDestination();
const monoSynth = new Tone.MonoSynth().toDestination();
const duoSynth = new Tone.DuoSynth().toDestination();
const pluckSynth = new Tone.PluckSynth().toDestination();

setInterval(function() {
    if (document.getElementById("progress-bar") != null) {
        var delta = Date.now() - start; // milliseconds elapsed since start
        if (Math.floor(delta/1000) == 4) {
            start += 4000;
            soundList = [];
            document.getElementById("progress-bar").textContent = "";
            progresslength = 0;
        }
        currentTime = delta;
        //console.dir(currentTime);
        
        let i;
        let j;
        for (i = 0; i < trackList.length; i++) {
            for (j = 0; j < trackList[i].length; j++) {
                if (Math.abs(trackList[i][j].time - currentTime) < 10) {
                    console.dir("match");
                    trackList[i][j].synth.triggerAttackRelease(trackList[i][j].note, "16n");
                }
            }
        }

        //console.dir("1: " + parseInt(currentTime/250));
        //console.dir("2: " + progresslength);
        if (parseInt(currentTime/250) > progresslength) {
            progresslength++;
            document.getElementById("progress-bar").textContent = document.getElementById("progress-bar").textContent + "=";
        }
    }
}, 10); // update about every 100th of a second

class SongBeat {
    constructor(note, time, synth) {
        this.note = note;
        this.time = time;
        this.synth = synth;
    }
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

    function DrumBoard() {
        const vol = new Tone.Volume(10).toDestination();

        const playDrum = (url) => {
            const player = new Tone.Player(url).toDestination();
            Tone.loaded().then(() => {
	            player.connect(vol).start();
            });
        };

        return (
            <div>
                <br></br>
                <br></br>
                <p>Drums:</p>
                <button onClick={() => playDrum("https://raw.githubusercontent.com/lukasswiss/hackhw21-sounds/main/drum-sounds/chinese-cymbal.mp3")}>13</button>
                <button onClick={() => playDrum("https://raw.githubusercontent.com/lukasswiss/hackhw21-sounds/main/drum-sounds/bass-drum-1.mp3")}>14</button>
                <button onClick={() => playDrum("https://raw.githubusercontent.com/lukasswiss/hackhw21-sounds/main/drum-sounds/acoustic-snare.mp3")}>15</button>
                <button onClick={() => playDrum("https://raw.githubusercontent.com/lukasswiss/hackhw21-sounds/main/drum-sounds/low-mid-tom.mp3")}>16</button>
                <br></br>
                <button onClick={() => playDrum("https://raw.githubusercontent.com/lukasswiss/hackhw21-sounds/main/drum-sounds/high-floor-tom.mp3")}>9</button>
                <button onClick={() => playDrum("https://raw.githubusercontent.com/lukasswiss/hackhw21-sounds/main/drum-sounds/hi-mid-tom.mp3")}>10</button>
                <button onClick={() => playDrum("https://raw.githubusercontent.com/lukasswiss/hackhw21-sounds/main/drum-sounds/electric-snare.mp3")}>11</button>
                <button onClick={() => playDrum("https://raw.githubusercontent.com/lukasswiss/hackhw21-sounds/main/drum-sounds/closed-hihat.mp3")}>12</button>
                <br></br>
                <button onClick={() => playDrum("https://raw.githubusercontent.com/lukasswiss/hackhw21-sounds/main/drum-sounds/open-hihat.mp3")}>5</button>
                <button onClick={() => playDrum("https://raw.githubusercontent.com/lukasswiss/hackhw21-sounds/main/drum-sounds/low-tom.mp3")}>6</button>
                <button onClick={() => playDrum("https://raw.githubusercontent.com/lukasswiss/hackhw21-sounds/main/drum-sounds/low-floor-tom.mp3")}>7</button>
                <button onClick={() => playDrum("https://raw.githubusercontent.com/lukasswiss/hackhw21-sounds/main/drum-sounds/high-tom.mp3")}>8</button>
                <br></br>
                <button onClick={() => playDrum("https://raw.githubusercontent.com/lukasswiss/hackhw21-sounds/main/drum-sounds/splash-cymbal.mp3")}>1</button>
                <button onClick={() => playDrum("https://raw.githubusercontent.com/lukasswiss/hackhw21-sounds/main/drum-sounds/ride-cymbal-1.mp3")}>2</button>
                <button onClick={() => playDrum("https://raw.githubusercontent.com/lukasswiss/hackhw21-sounds/main/drum-sounds/ride-bell.mp3")}>3</button>
                <button onClick={() => playDrum("https://raw.githubusercontent.com/lukasswiss/hackhw21-sounds/main/drum-sounds/pedal-hihat.mp3")}>4</button>
            </div>
        );
    }

    function SynthBoard() {
        const polySynth = new Tone.PolySynth(Tone.Synth).toDestination();
        
        const playNote = (note, synth) => {
            let currentNote = new SongBeat(note, currentTime, synth);
            let shouldpush = true;
            if (soundList.length > 0) {
                //console.dir(soundList[soundList.length - 1].time);
                
                const now = Tone.now();
                let addedTime = (parseInt(25 - (currentTime/10)%25)*10)
                synth.triggerAttackRelease(note, "16n", now + parseFloat(addedTime)/1000);
                //console.dir(currentTime + addedTime);
                //console.dir(Math.round((currentTime + addedTime)/250)*250)
                if ((Math.round((currentTime + addedTime)/250)*250) == soundList[soundList.length - 1].time) {
                    shouldpush = false;
                    console.dir("THE SAME");
                }
                console.dir("Current: " + (Math.round((currentTime + addedTime)/250)*250));
                console.dir("Previous: " + soundList[soundList.length - 1].time);
                currentNote.time = Math.round((currentTime + addedTime)/250)*250
            }
            else {
                const now = Tone.now();
                let addedTime = (parseInt(25 - (currentTime/10)%25)*10)
                synth.triggerAttackRelease(note, "16n", now + parseFloat(addedTime)/1000);

                //console.dir(currentTime + addedTime);
                //console.dir(Math.round((currentTime + addedTime)/250)*250);

                currentNote.time = Math.round((currentTime + addedTime)/250)*250
            }
            if (shouldpush) {
                soundList.push(currentNote);
                //console.dir(soundList);
                console.dir("different!");
            }
        };

        const loopTrack = () => {
            if (!trackList.includes(soundList)) {
                trackList.push(soundList);
                console.dir(trackList);
            }
        };

        const playTrack = () => {
            trackplaying = true;
        };

        const stopTrack = () => {
            trackplaying = true;
        };

        return (
            <div>
                <br></br>
                <br></br>
                <button onClick={() => loopTrack()}>Loop this</button>
                <button onClick={() => playTrack()}>Play track</button>
                <button onClick={() => stopTrack()}>Stop track</button>
                <br></br>
                <p>Default:</p>
                <button onClick={() => playNote("D5", defaultSynth)}>D5</button>
                <button onClick={() => playNote("E5", defaultSynth)}>E5</button>
                <button onClick={() => playNote("F5", defaultSynth)}>F5</button>
                <button onClick={() => playNote("G5", defaultSynth)}>G5</button>
                <br></br>
                <button onClick={() => playNote("G4", defaultSynth)}>G4</button>
                <button onClick={() => playNote("A4", defaultSynth)}>A4</button>
                <button onClick={() => playNote("B4", defaultSynth)}>B4</button>
                <button onClick={() => playNote("C5", defaultSynth)}>C5</button>
                <br></br>
                <button onClick={() => playNote("C4", defaultSynth)}>C4</button>
                <button onClick={() => playNote("D4", defaultSynth)}>D4</button>
                <button onClick={() => playNote("E4", defaultSynth)}>E4</button>
                <button onClick={() => playNote("F4", defaultSynth)}>F4</button>
                <br></br>
                <button onClick={() => playNote("F3", defaultSynth)}>F3</button>
                <button onClick={() => playNote("G3", defaultSynth)}>G3</button>
                <button onClick={() => playNote("A3", defaultSynth)}>A3</button>
                <button onClick={() => playNote("B3", defaultSynth)}>B3</button>
                <br></br>
                <p>FM:</p>
                <button onClick={() => playNote("D5", fmSynth)}>D5</button>
                <button onClick={() => playNote("E5", fmSynth)}>E5</button>
                <button onClick={() => playNote("F5", fmSynth)}>F5</button>
                <button onClick={() => playNote("G5", fmSynth)}>G5</button>
                <br></br>
                <button onClick={() => playNote("G4", fmSynth)}>G4</button>
                <button onClick={() => playNote("A4", fmSynth)}>A4</button>
                <button onClick={() => playNote("B4", fmSynth)}>B4</button>
                <button onClick={() => playNote("C5", fmSynth)}>C5</button>
                <br></br>
                <button onClick={() => playNote("C4", fmSynth)}>C4</button>
                <button onClick={() => playNote("D4", fmSynth)}>D4</button>
                <button onClick={() => playNote("E4", fmSynth)}>E4</button>
                <button onClick={() => playNote("F4", fmSynth)}>F4</button>
                <br></br>
                <button onClick={() => playNote("F3", fmSynth)}>F3</button>
                <button onClick={() => playNote("G3", fmSynth)}>G3</button>
                <button onClick={() => playNote("A3", fmSynth)}>A3</button>
                <button onClick={() => playNote("B3", fmSynth)}>B3</button>
                <br></br>
                <p>AM:</p>
                <button onClick={() => playNote("D5", amSynth)}>D5</button>
                <button onClick={() => playNote("E5", amSynth)}>E5</button>
                <button onClick={() => playNote("F5", amSynth)}>F5</button>
                <button onClick={() => playNote("G5", amSynth)}>G5</button>
                <br></br>
                <button onClick={() => playNote("G4", amSynth)}>G4</button>
                <button onClick={() => playNote("A4", amSynth)}>A4</button>
                <button onClick={() => playNote("B4", amSynth)}>B4</button>
                <button onClick={() => playNote("C5", amSynth)}>C5</button>
                <br></br>
                <button onClick={() => playNote("C4", amSynth)}>C4</button>
                <button onClick={() => playNote("D4", amSynth)}>D4</button>
                <button onClick={() => playNote("E4", amSynth)}>E4</button>
                <button onClick={() => playNote("F4", amSynth)}>F4</button>
                <br></br>
                <button onClick={() => playNote("F3", amSynth)}>F3</button>
                <button onClick={() => playNote("G3", amSynth)}>G3</button>
                <button onClick={() => playNote("A3", amSynth)}>A3</button>
                <button onClick={() => playNote("B3", amSynth)}>B3</button>
                <br></br>
                <p>Mono:</p>
                <button onClick={() => playNote("D5", monoSynth)}>D5</button>
                <button onClick={() => playNote("E5", monoSynth)}>E5</button>
                <button onClick={() => playNote("F5", monoSynth)}>F5</button>
                <button onClick={() => playNote("G5", monoSynth)}>G5</button>
                <br></br>
                <button onClick={() => playNote("G4", monoSynth)}>G4</button>
                <button onClick={() => playNote("A4", monoSynth)}>A4</button>
                <button onClick={() => playNote("B4", monoSynth)}>B4</button>
                <button onClick={() => playNote("C5", monoSynth)}>C5</button>
                <br></br>
                <button onClick={() => playNote("C4", monoSynth)}>C4</button>
                <button onClick={() => playNote("D4", monoSynth)}>D4</button>
                <button onClick={() => playNote("E4", monoSynth)}>E4</button>
                <button onClick={() => playNote("F4", monoSynth)}>F4</button>
                <br></br>
                <button onClick={() => playNote("F3", monoSynth)}>F3</button>
                <button onClick={() => playNote("G3", monoSynth)}>G3</button>
                <button onClick={() => playNote("A3", monoSynth)}>A3</button>
                <button onClick={() => playNote("B3", monoSynth)}>B3</button>
                <br></br>
                <p>Duo:</p>
                <button onClick={() => playNote("D5", duoSynth)}>D5</button>
                <button onClick={() => playNote("E5", duoSynth)}>E5</button>
                <button onClick={() => playNote("F5", duoSynth)}>F5</button>
                <button onClick={() => playNote("G5", duoSynth)}>G5</button>
                <br></br>
                <button onClick={() => playNote("G4", duoSynth)}>G4</button>
                <button onClick={() => playNote("A4", duoSynth)}>A4</button>
                <button onClick={() => playNote("B4", duoSynth)}>B4</button>
                <button onClick={() => playNote("C5", duoSynth)}>C5</button>
                <br></br>
                <button onClick={() => playNote("C4", duoSynth)}>C4</button>
                <button onClick={() => playNote("D4", duoSynth)}>D4</button>
                <button onClick={() => playNote("E4", duoSynth)}>E4</button>
                <button onClick={() => playNote("F4", duoSynth)}>F4</button>
                <br></br>
                <button onClick={() => playNote("F3", duoSynth)}>F3</button>
                <button onClick={() => playNote("G3", duoSynth)}>G3</button>
                <button onClick={() => playNote("A3", duoSynth)}>A3</button>
                <button onClick={() => playNote("B3", duoSynth)}>B3</button>
                <br></br>
                <p>Pluck:</p>
                <button onClick={() => playNote("D5", pluckSynth)}>D5</button>
                <button onClick={() => playNote("E5", pluckSynth)}>E5</button>
                <button onClick={() => playNote("F5", pluckSynth)}>F5</button>
                <button onClick={() => playNote("G5", pluckSynth)}>G5</button>
                <br></br>
                <button onClick={() => playNote("G4", pluckSynth)}>G4</button>
                <button onClick={() => playNote("A4", pluckSynth)}>A4</button>
                <button onClick={() => playNote("B4", pluckSynth)}>B4</button>
                <button onClick={() => playNote("C5", pluckSynth)}>C5</button>
                <br></br>
                <button onClick={() => playNote("C4", pluckSynth)}>C4</button>
                <button onClick={() => playNote("D4", pluckSynth)}>D4</button>
                <button onClick={() => playNote("E4", pluckSynth)}>E4</button>
                <button onClick={() => playNote("F4", pluckSynth)}>F4</button>
                <br></br>
                <button onClick={() => playNote("F3", pluckSynth)}>F3</button>
                <button onClick={() => playNote("G3", pluckSynth)}>G3</button>
                <button onClick={() => playNote("A3", pluckSynth)}>A3</button>
                <button onClick={() => playNote("B3", pluckSynth)}>B3</button>

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
            <DrumBoard />
            <SynthBoard />
            <span id="progress-bar"></span>
        </Container>
    );
};

export default Room;
