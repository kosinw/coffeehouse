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
import { useSocket } from "hooks/socket";
import { assignRef } from "use-callback-ref";
import * as Tone from 'tone';

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
    const socketRef = useSocket();
    const [socketInitialized, setSocketInitialized] = useState(false);
    const peersRef = useRef([]);
    const { roomID } = useParams();
    const { participants, updateParticipants } = useParticipants();
    const { playSong, songEnded, queueSong, songqueue } = useVideoBot();
    const { user } = useAuth();

    const [authLoading, setAuthLoading] = useState(true);

    // const defaultSynth = new Tone.Synth().toDestination();
    // const fmSynth = new Tone.FMSynth().toDestination();
    // const amSynth = new Tone.AMSynth().toDestination();
    // const monoSynth = new Tone.MonoSynth().toDestination();
    // const duoSynth = new Tone.DuoSynth().toDestination();
    // const pluckSynth = new Tone.PluckSynth().toDestination();
    // const synthArr = [defaultSynth, fmSynth, amSynth, monoSynth, duoSynth, pluckSynth];

    // let soundList = [];
    // let trackList = [];

    // class SongBeat {
    //     constructor(note, time, synth) {
    //         let synthNum = 0;
    //         for (var i = 0; i < synthArr.length; i++) {
    //             if (synthArr[i] == synth) {
    //                 synthNum = i;
    //                 break;
    //             }
    //         }
    //         this.note = note;
    //         this.time = time;
    //         this.synth = synthNum;
    //     }
    // }

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
        assignRef(socketRef, io.connect(process.env.REACT_APP_HOST_SERVER || "24.205.76.29:8000"));
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

            // socketRef.current.on("receiving message", messageData => {
            //     const data = JSON.parse(messageData);
            //     setChat(chat => [...chat, Message({
            //         sender: data.sender,
            //         message: data.message,
            //         isYou: false
            //     })]);
            // });

            // socketRef.current.on("noteLoop", noteData => {
            //     console.log(noteData)
            //     JSON.parse(noteData).forEach(element => {
            //         if (!trackList.includes(element)) {
            //             trackList.push(element);
            //         }
            //     })
            //     trackList.push(JSON.parse(noteData));
            // });

            // socketRef.current.on("noteReset", payload => {
            //     trackList = [];
            // });

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

    // let trackplaying = true;

    // let start = Date.now();
    // let currentTime = 0;
    // let progresslength = 0;

    // function SynthBoard() {
    //     setTimeout(function () {
    //         setInterval(function () {
    //             var delta = Date.now() - start; // milliseconds elapsed since start
    //             if (Math.floor(delta / 1000) >= 4) {
    //                 start += 4000;
    //                 soundList = [];
    //                 progresslength = 0;
    //             }
    //             currentTime = delta;
    //             //console.dir(currentTime);

    //             let i;
    //             let j;
    //             for (i = 0; i < trackList.length; i++) {
    //                 for (j = 0; j < trackList[i].length; j++) {
    //                     if (Math.abs(trackList[i][j].time - currentTime) < 10) {
    //                         console.dir("match");
    //                         synthArr[trackList[i][j].synth].triggerAttackRelease(trackList[i][j].note, "32n");
    //                     }
    //                 }
    //             }

    //             //console.dir("1: " + parseInt(currentTime/250));
    //             //console.dir("2: " + progresslength);
    //             if (parseInt(currentTime / 250) > progresslength) {
    //                 progresslength++;
    //             }
    //         }, 10); // update about every 100th of a second
    //     }, Date.now() % 4000);

    //     const playNote = (note, synth) => {
    //         let currentNote = new SongBeat(note, currentTime, synth);
    //         let shouldpush = true;
    //         try {
    //             if (soundList.length > 0) {
    //                 //console.dir(soundList[soundList.length - 1].time);

    //                 const now = Tone.now();
    //                 let addedTime = (parseInt(25 - (currentTime / 10) % 25) * 10)
    //                 synth.triggerAttackRelease(note, "32n", now + parseFloat(addedTime) / 1000);

    //                 //console.dir(currentTime + addedTime);
    //                 //console.dir(Math.round((currentTime + addedTime) / 250) * 250)

    //                 if ((Math.round((currentTime + addedTime) / 250) * 250) == soundList[soundList.length - 1].time) {
    //                     shouldpush = false;
    //                     //console.dir("THE SAME");
    //                 }
    //                 //console.dir("Current: " + (Math.round((currentTime + addedTime) / 250) * 250));
    //                 //console.dir("Previous: " + soundList[soundList.length - 1].tiFme);
    //                 currentNote.time = Math.round((currentTime + addedTime) / 250) * 250
    //             }
    //             else {
    //                 const now = Tone.now();
    //                 let addedTime = (parseInt(25 - (currentTime / 10) % 25) * 10)
    //                 synth.triggerAttackRelease(note, "32n", now + parseFloat(addedTime) / 1000);

    //                 //console.dir(currentTime + addedTime);
    //                 //console.dir(Math.round((currentTime + addedTime) / 250) * 250);

    //                 currentNote.time = Math.round((currentTime + addedTime) / 250) * 250
    //             }
    //         }
    //         catch (err) {
    //             console.log("tone problem again")
    //         }
    //         if (shouldpush) {
    //             soundList.push(currentNote);
    //         }
    //     };
    //     const loopTrack = () => {
    //         if (!trackList.includes(soundList)) {
    //             trackList.push(soundList);
    //             socketRef.current.emit("noteLoop", JSON.stringify(soundList));
    //         }
    //     };

    //     return (
    //         <div style={{ zIndex: "100000", position: "absolute", top: "350px", left: "30px" }}>
    //             <br></br>
    //             <br></br>
    //             <button onClick={() => loopTrack()}>Loop this</button>
    //             <br></br>
    //             <p>Default:</p>
    //             <button onClick={() => playNote("D5", defaultSynth)}>D5</button>
    //             <button onClick={() => playNote("E5", defaultSynth)}>E5</button>
    //             <button onClick={() => playNote("F5", defaultSynth)}>F5</button>
    //             <button onClick={() => playNote("G5", defaultSynth)}>G5</button><br></br>
    //             <button onClick={() => playNote("G4", defaultSynth)}>G4</button>
    //             <button onClick={() => playNote("A4", defaultSynth)}>A4</button>
    //             <button onClick={() => playNote("B4", defaultSynth)}>B4</button>
    //             <button onClick={() => playNote("C5", defaultSynth)}>C5</button>
    //             <br></br>
    //             <button onClick={() => playNote("C4", defaultSynth)}>C4</button>
    //             <button onClick={() => playNote("D4", defaultSynth)}>D4</button>
    //             <button onClick={() => playNote("E4", defaultSynth)}>E4</button>
    //             <button onClick={() => playNote("F4", defaultSynth)}>F4</button>
    //             <br></br>
    //             <button onClick={() => playNote("F3", defaultSynth)}>F3</button>
    //             <button onClick={() => playNote("G3", defaultSynth)}>G3</button>
    //             <button onClick={() => playNote("A3", defaultSynth)}>A3</button>
    //             <button onClick={() => playNote("B3", defaultSynth)}>B3</button>
    //             <br></br>
    //             <p>FM:</p>
    //             <button onClick={() => playNote("D5", fmSynth)}>D5</button>
    //             <button onClick={() => playNote("E5", fmSynth)}>E5</button>
    //             <button onClick={() => playNote("F5", fmSynth)}>F5</button>
    //             <button onClick={() => playNote("G5", fmSynth)}>G5</button>
    //             <br></br>
    //             <button onClick={() => playNote("G4", fmSynth)}>G4</button>
    //             <button onClick={() => playNote("A4", fmSynth)}>A4</button>
    //             <button onClick={() => playNote("B4", fmSynth)}>B4</button>
    //             <button onClick={() => playNote("C5", fmSynth)}>C5</button>
    //             <br></br>
    //             <button onClick={() => playNote("C4", fmSynth)}>C4</button>
    //             <button onClick={() => playNote("D4", fmSynth)}>D4</button>
    //             <button onClick={() => playNote("E4", fmSynth)}>E4</button>
    //             <button onClick={() => playNote("F4", fmSynth)}>F4</button>
    //             <br></br>
    //             <button onClick={() => playNote("F3", fmSynth)}>F3</button>
    //             <button onClick={() => playNote("G3", fmSynth)}>G3</button>
    //             <button onClick={() => playNote("A3", fmSynth)}>A3</button>
    //             <button onClick={() => playNote("B3", fmSynth)}>B3</button>
    //             <br></br>
    //             <p>AM:</p>
    //             <button onClick={() => playNote("D5", amSynth)}>D5</button>
    //             <button onClick={() => playNote("E5", amSynth)}>E5</button>
    //             <button onClick={() => playNote("F5", amSynth)}>F5</button>
    //             <button onClick={() => playNote("G5", amSynth)}>G5</button>
    //             <br></br>
    //             <button onClick={() => playNote("G4", amSynth)}>G4</button>
    //             <button onClick={() => playNote("A4", amSynth)}>A4</button>
    //             <button onClick={() => playNote("B4", amSynth)}>B4</button>
    //             <button onClick={() => playNote("C5", amSynth)}>C5</button>
    //             <br></br>
    //             <button onClick={() => playNote("C4", amSynth)}>C4</button>
    //             <button onClick={() => playNote("D4", amSynth)}>D4</button>
    //             <button onClick={() => playNote("E4", amSynth)}>E4</button>
    //             <button onClick={() => playNote("F4", amSynth)}>F4</button>
    //             <br></br>
    //             <button onClick={() => playNote("F3", amSynth)}>F3</button>
    //             <button onClick={() => playNote("G3", amSynth)}>G3</button>
    //             <button onClick={() => playNote("A3", amSynth)}>A3</button>
    //             <button onClick={() => playNote("B3", amSynth)}>B3</button>
    //             <br></br>
    //             <p>Mono:</p>
    //             <button onClick={() => playNote("D5", monoSynth)}>D5</button>
    //             <button onClick={() => playNote("E5", monoSynth)}>E5</button>
    //             <button onClick={() => playNote("F5", monoSynth)}>F5</button>
    //             <button onClick={() => playNote("G5", monoSynth)}>G5</button>
    //             <br></br>
    //             <button onClick={() => playNote("G4", monoSynth)}>G4</button>
    //             <button onClick={() => playNote("A4", monoSynth)}>A4</button>
    //             <button onClick={() => playNote("B4", monoSynth)}>B4</button>
    //             <button onClick={() => playNote("C5", monoSynth)}>C5</button>
    //             <br></br>
    //             <button onClick={() => playNote("C4", monoSynth)}>C4</button>
    //             <button onClick={() => playNote("D4", monoSynth)}>D4</button>
    //             <button onClick={() => playNote("E4", monoSynth)}>E4</button>
    //             <button onClick={() => playNote("F4", monoSynth)}>F4</button>
    //             <br></br>
    //             <button onClick={() => playNote("F3", monoSynth)}>F3</button>
    //             <button onClick={() => playNote("G3", monoSynth)}>G3</button>
    //             <button onClick={() => playNote("A3", monoSynth)}>A3</button>
    //             <button onClick={() => playNote("B3", monoSynth)}>B3</button>
    //             <br></br>
    //             <p>Duo:</p>
    //             <button onClick={() => playNote("D5", duoSynth)}>D5</button>
    //             <button onClick={() => playNote("E5", duoSynth)}>E5</button>
    //             <button onClick={() => playNote("F5", duoSynth)}>F5</button>
    //             <button onClick={() => playNote("G5", duoSynth)}>G5</button>
    //             <br></br>
    //             <button onClick={() => playNote("G4", duoSynth)}>G4</button>
    //             <button onClick={() => playNote("A4", duoSynth)}>A4</button>
    //             <button onClick={() => playNote("B4", duoSynth)}>B4</button>
    //             <button onClick={() => playNote("C5", duoSynth)}>C5</button>
    //             <br></br>
    //             <button onClick={() => playNote("C4", duoSynth)}>C4</button>
    //             <button onClick={() => playNote("D4", duoSynth)}>D4</button>
    //             <button onClick={() => playNote("E4", duoSynth)}>E4</button>
    //             <button onClick={() => playNote("F4", duoSynth)}>F4</button>
    //             <br></br>
    //             <button onClick={() => playNote("F3", duoSynth)}>F3</button>
    //             <button onClick={() => playNote("G3", duoSynth)}>G3</button>
    //             <button onClick={() => playNote("A3", duoSynth)}>A3</button>
    //             <button onClick={() => playNote("B3", duoSynth)}>B3</button>
    //             <br></br>
    //             <p>Pluck:</p>
    //             <button onClick={() => playNote("D5", pluckSynth)}>D5</button>
    //             <button onClick={() => playNote("E5", pluckSynth)}>E5</button>
    //             <button onClick={() => playNote("F5", pluckSynth)}>F5</button>
    //             <button onClick={() => playNote("G5", pluckSynth)}>G5</button>
    //             <br></br>
    //             <button onClick={() => playNote("G4", pluckSynth)}>G4</button>
    //             <button onClick={() => playNote("A4", pluckSynth)}>A4</button>
    //             <button onClick={() => playNote("B4", pluckSynth)}>B4</button>
    //             <button onClick={() => playNote("C5", pluckSynth)}>C5</button>
    //             <br></br>
    //             <button onClick={() => playNote("C4", pluckSynth)}>C4</button>
    //             <button onClick={() => playNote("D4", pluckSynth)}>D4</button>
    //             <button onClick={() => playNote("E4", pluckSynth)}>E4</button>
    //             <button onClick={() => playNote("F4", pluckSynth)}>F4</button>
    //             <br></br>
    //             <button onClick={() => playNote("F3", pluckSynth)}>F3</button>
    //             <button onClick={() => playNote("G3", pluckSynth)}>G3</button>
    //             <button onClick={() => playNote("A3", pluckSynth)}>A3</button>
    //             <button onClick={() => playNote("B3", pluckSynth)}>B3</button>
    //         </div>
    //     );
    // }

    return (
        <>
            {/* <SynthBoard /> */}
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