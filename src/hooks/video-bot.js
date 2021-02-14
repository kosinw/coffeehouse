import React, { useContext, createContext, useRef, useState } from "react";

const videoBotContext = createContext();

export function useVideoBot() {
    return useContext(videoBotContext);
}

function useProvideVideoBot() {
    const [uri, setUri] = useState(null);
    const [playerRunning, setPlaying] = useState(true);
    const songqueue = useRef([]);
    const [startPlayingSong, setStartPlayingSong] = useState(0);

    function songEnded(time) {
        songqueue.current.shift();
        if (songqueue.current.length > 0) {
            playSong(songqueue.current[0], time);
            setPlaying(true);
        }
        else {
            setPlaying(false);
        }
    }

    function playSong(url, time) {
        setStartPlayingSong(time);
        setUri(url);
    }

    function queueSong(url) {
        songqueue.current.push(url);
    }

    return {
        uri,
        playerRunning,
        songEnded,
        playSong,
        songqueue,
        startPlayingSong,
        setStartPlayingSong,
        queueSong,
        setPlaying
    };
}

export function ProvideVideoBot({ children }) {
    const state = useProvideVideoBot();

    return (
        <videoBotContext.Provider value={state}>
            {children}
        </videoBotContext.Provider>
    );
}