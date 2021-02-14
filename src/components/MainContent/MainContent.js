/** @jsx jsx */
import { jsx } from '@emotion/react'
import tw from 'twin.macro';
import React, { useRef } from "react";
import VideoGrid from "./VideoGrid"
import ControlsOverlay from "./ControlsOverlay";

function MainContent() {
    const userVideo = useRef();

    return (
        <div tw="flex flex-1 relative overflow-hidden h-full flex-col w-full bg-black">
            <VideoGrid userVideo={userVideo} />
            <ControlsOverlay userVideo={userVideo} />
        </div>
    );
}

export default MainContent;