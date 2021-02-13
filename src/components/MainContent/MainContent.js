/** @jsx jsx */
import { jsx } from '@emotion/react'
import tw from 'twin.macro';
import React from "react";
import VideoGrid from "./VideoGrid"

function MainContent() {
    return (
        <div tw="flex flex-1 relative overflow-hidden h-full flex-col w-full bg-black">
            <VideoGrid />
        </div>
    );
}

export default MainContent;