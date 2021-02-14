/** @jsx jsx */
import { jsx } from '@emotion/react'
import tw, { styled, css } from 'twin.macro';
import React, { useEffect, useRef, useState } from "react";

const FrameWrapper = styled.div(({ letter }) => [
    css`grid-area: ${letter} / ${letter} / ${letter} / ${letter};`,
    tw`h-full w-full transition-all duration-200 ease-linear`,
])

const VideoWrapper = styled.div(({ }) => [
    css`transform: translateZ(1px) scaleX(-1);`,
    tw`h-full w-full`
]);

function PeerVideo({ peer, grid }) {
    const ref = useRef();

    useEffect(() => {
        peer.on("stream", stream => {
            ref.current.srcObject = stream;
        })
    }, [])

    return (

        <FrameWrapper letter={grid}>
            <VideoWrapper>
                <video ref={ref} tw="w-full object-cover h-full" playsInline autoPlay muted />
            </VideoWrapper>
        </FrameWrapper>
    );
}

export default PeerVideo;