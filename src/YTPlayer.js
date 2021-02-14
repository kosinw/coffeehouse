import ReactPlayer from 'react-player/youtube';
import React, { useEffect, useRef, useState } from "react";
import { useVideoBot } from "./hooks/video-bot";

function Video() {
    // const [uri, setUri] = useState(null);
    // const [playerRunning, setPlaying] = useState(true);

    const { 
        uri,
        playerRunning,
        songEnded, 
        setPlaying, 
        songqueue, 
        startPlayingSong, 
        setStartPlayingSong 
    } = useVideoBot();

    // const songqueue = [];
    // let startPlayingSong = 0;

    // function songEnded() {
    //     if (songqueue.length > 0) {
    //         playSong(songqueue[0], 0);
    //         setPlaying(true);
    //     }
    //     else {
    //         setPlaying(false);
    //         songplaying = false;
    //     }
    // }

    // function playSong(url, time) {
    //     startPlayingSong = time;
    //     setUri(url);
    // }

    // const SearchButton = React.memo((props) => {
    //     const startSong = () => {
    //         setTimeout(function () {
    //             songplaying = true;
    //             setPlaying(true);
    //             songqueue.shift();
    //         }, Math.max(startPlayingSong - Date.now(), 0));
    //     }
    //     return (
    //         <div>
    //             <ReactPlayer
    //                 url={uri}
    //                 volume={playerVol}
    //                 playing={playerRunning}
    //                 height='0px'
    //                 width='0px'
    //                 onReady={() => startSong()}
    //                 onEnded={() => songEnded()}
    //                 id="ytPlayer"
    //             />
    //         </div>
    //     );
    // });

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