/** @jsx jsx */
import { jsx } from '@emotion/react'
import tw, { styled, css } from 'twin.macro';
import React, { useEffect, useRef, useState } from "react";

const FrameWrapper = styled.div(({ }) => [
    css`grid-area: A / A / A / A;`,
    tw`h-full w-full transition-all duration-200 ease-linear`,
])

const VideoWrapper = styled.div(({ }) => [
    css`transform: translateZ(1px) scaleX(-1);`,
    tw`h-full w-full`
]);

const LocalVideo = React.forwardRef((_props, ref) => (
    <FrameWrapper>
        <VideoWrapper>
            <video ref={ref} tw="w-full object-cover h-full" playsInline autoPlay />
        </VideoWrapper>
    </FrameWrapper>
));

export default LocalVideo;