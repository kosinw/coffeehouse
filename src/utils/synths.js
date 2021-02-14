/*
import React, { useEffect } from "react";
import * as Tone from 'tone';

const defaultSynth = new Tone.Synth().toDestination();
const fmSynth = new Tone.FMSynth().toDestination();
const amSynth = new Tone.AMSynth().toDestination();
const monoSynth = new Tone.MonoSynth().toDestination();
const duoSynth = new Tone.DuoSynth().toDestination();
const pluckSynth = new Tone.PluckSynth().toDestination();

let soundList = [];
let trackList = [];

let trackplaying = true;

let start = Date.now();
let currentTime = 0;
let progresslength = 0;

class SongBeat {
    constructor(note, time, synth) {
        this.note = note;
        this.time = time;
        this.synth = synth;
    }
}

function SynthBoard() {
    const polySynth = new Tone.PolySynth(Tone.Synth).toDestination();

    useEffect(() => {
        setTimeout(function () {
            start=Date.now();
            setInterval(function () {
                var delta = Date.now() - start; // milliseconds elapsed since start
                if (Math.floor(delta / 1000) >= 4) {
                    start += 4000;
                    soundList = [];
                    progresslength = 0;
                }
                currentTime = delta;
                console.dir(currentTime);

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
                if (parseInt(currentTime / 250) > progresslength) {
                    progresslength++;
                }
            }, 10); // update about every 100th of a second
        },Date.now()%4000);
    }, []);

    const playNote = (note, synth) => {
        let currentNote = new SongBeat(note, currentTime, synth);
        let shouldpush = true;
        if (soundList.length > 0) {
            console.dir(soundList[soundList.length - 1].time);

            const now = Tone.now();
            let addedTime = (parseInt(25 - (currentTime / 10) % 25) * 10)
            synth.triggerAttackRelease(note, "16n", now + parseFloat(addedTime) / 1000);

            console.dir(currentTime + addedTime);
            console.dir(Math.round((currentTime + addedTime) / 250) * 250)

            if ((Math.round((currentTime + addedTime) / 250) * 250) == soundList[soundList.length - 1].time) {
                shouldpush = false;
                console.dir("THE SAME");
            }
            console.dir("Current: " + (Math.round((currentTime + addedTime) / 250) * 250));
            console.dir("Previous: " + soundList[soundList.length - 1].tiFme);
            currentNote.time = Math.round((currentTime + addedTime) / 250) * 250
        }
        else {
            const now = Tone.now();
            let addedTime = (parseInt(25 - (currentTime / 10) % 25) * 10)
            synth.triggerAttackRelease(note, "16n", now + parseFloat(addedTime) / 1000);

            console.dir(currentTime + addedTime);
            console.dir(Math.round((currentTime + addedTime) / 250) * 250);

            currentNote.time = Math.round((currentTime + addedTime) / 250) * 250
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

    return (
        <div style={{ zIndex: "100000", position: "absolute", top: "350px", left: "30px" }}>
            <br></br>
            <br></br>
            <button onClick={() => loopTrack()}>Loop this</button>
            <br></br>
            <p>Default:</p>
            <button onClick={() => playNote("D5", defaultSynth)}>D5</button>
            <button onClick={() => playNote("E5", defaultSynth)}>E5</button>
            <button onClick={() => playNote("F5", defaultSynth)}>F5</button>
            <button onClick={() => playNote("G5", defaultSynth)}>G5</button><br></br>
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

export default SynthBoard;
*/