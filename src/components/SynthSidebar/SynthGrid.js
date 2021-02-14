/** @jsx jsx */
import { jsx } from '@emotion/react'
import tw, { css, styled } from 'twin.macro';
import React, { useState, useEffect, useRef } from "react";
import { useParticipants } from "hooks/participants";
import * as Tone from 'tone';
import { useSocket } from "hooks/socket";
import { Scale } from "@tonaljs/tonal";
import { Progress } from "@chakra-ui/react";


function SynthGridSection() {
    const socketRef = useSocket();
    const tempProgress = useRef();

    const defaultSynth = new Tone.Synth().toDestination();
    const fmSynth = new Tone.FMSynth().toDestination();
    const amSynth = new Tone.AMSynth().toDestination();
    const monoSynth = new Tone.MonoSynth().toDestination();
    const duoSynth = new Tone.DuoSynth().toDestination();
    const pluckSynth = new Tone.PluckSynth().toDestination();
    const synthArr = [defaultSynth, fmSynth, amSynth, monoSynth, duoSynth, pluckSynth];

    let soundList = [];
    let trackList = [];

    const [init, setInit] = useState(false);

    // let trackplaying = true;
    useEffect(() => {
        if (!!socketRef.current && !init) {
            socketRef.current.on("noteLoop", noteData => {
                console.log(noteData)
                JSON.parse(noteData).forEach(element => {
                    if (!trackList.includes(element)) {
                        trackList.push(element);
                    }
                })
                trackList.push(JSON.parse(noteData));
            });

            socketRef.current.on("noteReset", payload => {
                trackList = [];
            });

            setInit(true);
        }
    })

    let start = Date.now();
    let currentTime = 0;
    let progresslength = 0;

    class SongBeat {
        constructor(note, time, synth) {
            let synthNum = 0;
            for (var i = 0; i < synthArr.length; i++) {
                if (synthArr[i] == synth) {
                    synthNum = i;
                    break;
                }
            }
            this.note = note;
            this.time = time;
            this.synth = synthNum;
        }
    }


    function SynthBoard() {
        useEffect(() => {
            let interval;
            setTimeout(function () {
                interval = setInterval(function () {
                    let lastUpdate = 0;
                    var delta = Date.now() - start; // milliseconds elapsed since start
                    if (Math.floor(delta / 1000) >= 4) {
                        start += 4000;
                        soundList = [];
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
                                synthArr[trackList[i][j].synth].triggerAttackRelease(trackList[i][j].note, "32n");
                            }
                        }
                    }
    
                    tempProgress.current = currentTime;
    
                    // setProgress((delta / 4000) * 100);
    
                    //console.dir("1: " + parseInt(currentTime/250));
                    //console.dir("2: " + progresslength);
                    // if (parseInt(currentTime / 250) > progresslength) {
                    //     progresslength++;
                    // }
    
                }, 10); // update about every 100th of a second
            }, Date.now() % 4000);
        }, [])

        const playNote = (note, synth) => {
            let currentNote = new SongBeat(note, currentTime, synth);
            let shouldpush = true;
            try {
                if (soundList.length > 0) {
                    //console.dir(soundList[soundList.length - 1].time);

                    const now = Tone.now();
                    let addedTime = (parseInt(25 - (currentTime / 10) % 25) * 10)
                    synth.triggerAttackRelease(note, "32n", now + parseFloat(addedTime) / 1000);

                    //console.dir(currentTime + addedTime);
                    //console.dir(Math.round((currentTime + addedTime) / 250) * 250)

                    if ((Math.round((currentTime + addedTime) / 250) * 250) == soundList[soundList.length - 1].time) {
                        shouldpush = false;
                        //console.dir("THE SAME");
                    }
                    //console.dir("Current: " + (Math.round((currentTime + addedTime) / 250) * 250));
                    //console.dir("Previous: " + soundList[soundList.length - 1].tiFme);
                    currentNote.time = Math.round((currentTime + addedTime) / 250) * 250
                }
                else {
                    const now = Tone.now();
                    let addedTime = (parseInt(25 - (currentTime / 10) % 25) * 10)
                    synth.triggerAttackRelease(note, "32n", now + parseFloat(addedTime) / 1000);

                    //console.dir(currentTime + addedTime);
                    //console.dir(Math.round((currentTime + addedTime) / 250) * 250);

                    currentNote.time = Math.round((currentTime + addedTime) / 250) * 250
                }
            }
            catch (err) {
                console.log("tone problem again")
            }
            if (shouldpush) {
                soundList.push(currentNote);
            }
        };
        const loopTrack = () => {
            if (!trackList.includes(soundList)) {
                trackList.push(soundList);
                console.log(trackList);
                socketRef.current.emit("noteLoop", JSON.stringify(soundList));
            }
        };

        // return (
        //     <div style={{ zIndex: "100000", position: "absolute", top: "350px", left: "30px" }}>
        //         <br></br>
        //         <br></br>
        //         <button onClick={() => loopTrack()}>Loop this</button>
        //         <br></br>
        //         <p>Default:</p>
        //         <button onClick={() => playNote("D5", defaultSynth)}>D5</button>
        //         <button onClick={() => playNote("E5", defaultSynth)}>E5</button>
        //         <button onClick={() => playNote("F5", defaultSynth)}>F5</button>
        //         <button onClick={() => playNote("G5", defaultSynth)}>G5</button><br></br>
        //         <button onClick={() => playNote("G4", defaultSynth)}>G4</button>
        //         <button onClick={() => playNote("A4", defaultSynth)}>A4</button>
        //         <button onClick={() => playNote("B4", defaultSynth)}>B4</button>
        //         <button onClick={() => playNote("C5", defaultSynth)}>C5</button>
        //         <br></br>
        //         <button onClick={() => playNote("C4", defaultSynth)}>C4</button>
        //         <button onClick={() => playNote("D4", defaultSynth)}>D4</button>
        //         <button onClick={() => playNote("E4", defaultSynth)}>E4</button>
        //         <button onClick={() => playNote("F4", defaultSynth)}>F4</button>
        //         <br></br>
        //         <button onClick={() => playNote("F3", defaultSynth)}>F3</button>
        //         <button onClick={() => playNote("G3", defaultSynth)}>G3</button>
        //         <button onClick={() => playNote("A3", defaultSynth)}>A3</button>
        //         <button onClick={() => playNote("B3", defaultSynth)}>B3</button>
        //         <br></br>
        //         <p>FM:</p>
        //         <button onClick={() => playNote("D5", fmSynth)}>D5</button>
        //         <button onClick={() => playNote("E5", fmSynth)}>E5</button>
        //         <button onClick={() => playNote("F5", fmSynth)}>F5</button>
        //         <button onClick={() => playNote("G5", fmSynth)}>G5</button>
        //         <br></br>
        //         <button onClick={() => playNote("G4", fmSynth)}>G4</button>
        //         <button onClick={() => playNote("A4", fmSynth)}>A4</button>
        //         <button onClick={() => playNote("B4", fmSynth)}>B4</button>
        //         <button onClick={() => playNote("C5", fmSynth)}>C5</button>
        //         <br></br>
        //         <button onClick={() => playNote("C4", fmSynth)}>C4</button>
        //         <button onClick={() => playNote("D4", fmSynth)}>D4</button>
        //         <button onClick={() => playNote("E4", fmSynth)}>E4</button>
        //         <button onClick={() => playNote("F4", fmSynth)}>F4</button>
        //         <br></br>
        //         <button onClick={() => playNote("F3", fmSynth)}>F3</button>
        //         <button onClick={() => playNote("G3", fmSynth)}>G3</button>
        //         <button onClick={() => playNote("A3", fmSynth)}>A3</button>
        //         <button onClick={() => playNote("B3", fmSynth)}>B3</button>
        //         <br></br>
        //         <p>AM:</p>
        //         <button onClick={() => playNote("D5", amSynth)}>D5</button>
        //         <button onClick={() => playNote("E5", amSynth)}>E5</button>
        //         <button onClick={() => playNote("F5", amSynth)}>F5</button>
        //         <button onClick={() => playNote("G5", amSynth)}>G5</button>
        //         <br></br>
        //         <button onClick={() => playNote("G4", amSynth)}>G4</button>
        //         <button onClick={() => playNote("A4", amSynth)}>A4</button>
        //         <button onClick={() => playNote("B4", amSynth)}>B4</button>
        //         <button onClick={() => playNote("C5", amSynth)}>C5</button>
        //         <br></br>
        //         <button onClick={() => playNote("C4", amSynth)}>C4</button>
        //         <button onClick={() => playNote("D4", amSynth)}>D4</button>
        //         <button onClick={() => playNote("E4", amSynth)}>E4</button>
        //         <button onClick={() => playNote("F4", amSynth)}>F4</button>
        //         <br></br>
        //         <button onClick={() => playNote("F3", amSynth)}>F3</button>
        //         <button onClick={() => playNote("G3", amSynth)}>G3</button>
        //         <button onClick={() => playNote("A3", amSynth)}>A3</button>
        //         <button onClick={() => playNote("B3", amSynth)}>B3</button>
        //         <br></br>
        //         <p>Mono:</p>
        //         <button onClick={() => playNote("D5", monoSynth)}>D5</button>
        //         <button onClick={() => playNote("E5", monoSynth)}>E5</button>
        //         <button onClick={() => playNote("F5", monoSynth)}>F5</button>
        //         <button onClick={() => playNote("G5", monoSynth)}>G5</button>
        //         <br></br>
        //         <button onClick={() => playNote("G4", monoSynth)}>G4</button>
        //         <button onClick={() => playNote("A4", monoSynth)}>A4</button>
        //         <button onClick={() => playNote("B4", monoSynth)}>B4</button>
        //         <button onClick={() => playNote("C5", monoSynth)}>C5</button>
        //         <br></br>
        //         <button onClick={() => playNote("C4", monoSynth)}>C4</button>
        //         <button onClick={() => playNote("D4", monoSynth)}>D4</button>
        //         <button onClick={() => playNote("E4", monoSynth)}>E4</button>
        //         <button onClick={() => playNote("F4", monoSynth)}>F4</button>
        //         <br></br>
        //         <button onClick={() => playNote("F3", monoSynth)}>F3</button>
        //         <button onClick={() => playNote("G3", monoSynth)}>G3</button>
        //         <button onClick={() => playNote("A3", monoSynth)}>A3</button>
        //         <button onClick={() => playNote("B3", monoSynth)}>B3</button>
        //         <br></br>
        //         <p>Duo:</p>
        //         <button onClick={() => playNote("D5", duoSynth)}>D5</button>
        //         <button onClick={() => playNote("E5", duoSynth)}>E5</button>
        //         <button onClick={() => playNote("F5", duoSynth)}>F5</button>
        //         <button onClick={() => playNote("G5", duoSynth)}>G5</button>
        //         <br></br>
        //         <button onClick={() => playNote("G4", duoSynth)}>G4</button>
        //         <button onClick={() => playNote("A4", duoSynth)}>A4</button>
        //         <button onClick={() => playNote("B4", duoSynth)}>B4</button>
        //         <button onClick={() => playNote("C5", duoSynth)}>C5</button>
        //         <br></br>
        //         <button onClick={() => playNote("C4", duoSynth)}>C4</button>
        //         <button onClick={() => playNote("D4", duoSynth)}>D4</button>
        //         <button onClick={() => playNote("E4", duoSynth)}>E4</button>
        //         <button onClick={() => playNote("F4", duoSynth)}>F4</button>
        //         <br></br>
        //         <button onClick={() => playNote("F3", duoSynth)}>F3</button>
        //         <button onClick={() => playNote("G3", duoSynth)}>G3</button>
        //         <button onClick={() => playNote("A3", duoSynth)}>A3</button>
        //         <button onClick={() => playNote("B3", duoSynth)}>B3</button>
        //         <br></br>
        //         <p>Pluck:</p>
        //         <button onClick={() => playNote("D5", pluckSynth)}>D5</button>
        //         <button onClick={() => playNote("E5", pluckSynth)}>E5</button>
        //         <button onClick={() => playNote("F5", pluckSynth)}>F5</button>
        //         <button onClick={() => playNote("G5", pluckSynth)}>G5</button>
        //         <br></br>
        //         <button onClick={() => playNote("G4", pluckSynth)}>G4</button>
        //         <button onClick={() => playNote("A4", pluckSynth)}>A4</button>
        //         <button onClick={() => playNote("B4", pluckSynth)}>B4</button>
        //         <button onClick={() => playNote("C5", pluckSynth)}>C5</button>
        //         <br></br>
        //         <button onClick={() => playNote("C4", pluckSynth)}>C4</button>
        //         <button onClick={() => playNote("D4", pluckSynth)}>D4</button>
        //         <button onClick={() => playNote("E4", pluckSynth)}>E4</button>
        //         <button onClick={() => playNote("F4", pluckSynth)}>F4</button>
        //         <br></br>
        //         <button onClick={() => playNote("F3", pluckSynth)}>F3</button>
        //         <button onClick={() => playNote("G3", pluckSynth)}>G3</button>
        //         <button onClick={() => playNote("A3", pluckSynth)}>A3</button>
        //         <button onClick={() => playNote("B3", pluckSynth)}>B3</button>
        //     </div>
        // );

        const width = 4;
        const height = 4;

        const GridContainer = tw.div`grid gap-x-1 grid-rows-${height} w-full grid-cols-${width}`

        const colors = [
            "#FCE7F3",
            "#FBCFE8",
            "#F9A8D4",
            "#F472B6",
            "#EC4899",
            "#DB2777",
            "#BE185D",
            "#9D174D",
            "#831843"
        ];

        const map = [
            ["Q", "W", "E", "R"],
            ["A", "S", "D", "F"],
            ["Z", "X", "C", "V"]
        ];

        const ColoredButton = styled.button(({ row, col }) => [
            css`background-color: ${colors[((row * height + col) % 9)]}`
        ]);

        const LoopButton = tw.button`w-full mt-2 h-8 bg-pink-900`

        function handleButtonClick(row, col) {
            const scale = Scale.get("c5 pentatonic").notes;
            const idx = height * row + col;

            playNote(scale[idx % scale.length], fmSynth);
        }

        function handleLoop(e) {
            loopTrack();
        }

        return (
            <div tw="flex flex-col">
                <GridContainer>
                    {[...Array(height)].map((_, row) => {
                        return [...Array(width)].map((_, col) =>
                            <div key={`${row * height + col}`}>
                                <ColoredButton
                                    onClick={() => handleButtonClick(row, col)}
                                    row={row}
                                    col={col}
                                    tw="inline-flex h-16 w-full focus:(outline-none opacity-70)"
                                />
                            </div>
                        )
                    })}
                </GridContainer>
                <LoopButton onClick={handleLoop} />
            </div>
        );
    }

    function SynthProgress() {
        const [progressValue, setProgress] = useState(0);

        // let interval = setInterval(() => {
        //     setProgress((tempProgress.current / 4000) * 100);
        // }, 250)


        return (<Progress colorScheme="pink" size="sm" tw="mb-2" value={progressValue} />);
    }

    return (
        <div tw="flex flex-col p-5">
            <SynthProgress />
            <SynthBoard />
        </div>
    );
}

function SynthGrid() {
    const { otherParticipants: profiles } = useParticipants();

    return (
        <div tw="flex" css="">
            <div tw="flex flex-col w-full">
                <div css="background-color: #1E1F1F;" tw="flex w-full py-3 px-5">
                    <h3 tw="text-xs font-bold uppercase leading-3">FM Synth</h3>
                </div>
                <SynthGridSection />
            </div>
        </div>
    );
}

export default SynthGrid;
