import ReactPlayer from 'react-player/youtube';
import React, { useEffect, useRef, useState } from "react";
import { useVideoBot } from "../../hooks/video-bot";

function Video() {
    const { 
        uri,
        playerRunning,
        songEnded, 
        setPlaying, 
        songqueue, 
        startPlayingSong, 
        setStartPlayingSong 
    } = useVideoBot();

    const startSong = () => {
        setPlaying(false);
        setTimeout(function () {
            setPlaying(true);
        }, Math.max(startPlayingSong - Date.now(), 0));
    }

    return <ReactPlayer
        url={uri}
        playing={playerRunning}
        height='0px'
        width='0px'
        onReady={() => startSong()}
        onEnded={songEnded}
    />;
}
export default Video;