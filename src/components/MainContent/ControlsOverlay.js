/** @jsx jsx */
import { jsx } from '@emotion/react'
import tw, { styled, css } from 'twin.macro';
import React, { useEffect, useRef, useState } from "react";
import { BiMicrophone, BiVideo, BiHeadphone, BiMicrophoneOff, BiVideoOff } from "react-icons/bi";
import { FaDeaf } from "react-icons/fa";

const ControlsContainer =
    styled.div(() => [
        tw`self-center absolute bg-black bg-opacity-0
         transition-colors bottom-0 duration-500
         ease-linear hover:(bg-opacity-80) z-50 rounded-2xl mb-10`,

        css`transform: translateZ(1px);`
    ]);


const ControlButtonContainer = styled.div(() => [
    tw`inline-block relative py-5 px-2.5`
]);

const ControlButton = React.forwardRef((props, ref) => {
    return (
        <ControlButtonContainer tw="text-white">
            <span tw="flex px-5 py-2">
                <button tw="focus:outline-none" {...props} ref={ref}>
                    {props.children}
                </button>
            </span>
        </ControlButtonContainer>
    );
})

function useToggle(defaultValue = false) {
    const [state, setState] = useState(defaultValue);

    const toggle = () => {
        setState(!state);
    }

    return [state, toggle];
}

function ControlsOverlay({ userVideo }) {
    const [muted, toggleMuted] = useToggle(false);
    const [videoOn, toggleVideo] = useToggle(true);
    const [deafened, toggleDeafened] = useToggle(false);

    useEffect(() => {
        if (!!userVideo.current &&
            !!userVideo.current.srcObject &&
            !!userVideo.current.srcObject.getAudioTracks()[0]) {
            userVideo.current.srcObject.getAudioTracks()[0].enabled = !muted;
        }
    }, [muted]);

    useEffect(() => {
        if (!!userVideo.current &&
            !!userVideo.current.srcObject &&
            !!userVideo.current.srcObject.getVideoTracks()[0]) {
            userVideo.current.srcObject.getVideoTracks()[0].enabled = videoOn;
        }
    }, [videoOn]);

    useEffect(() => {
        const elems = document.querySelectorAll("video, audio");
        [].forEach.call(elems, function (elem) { elem.muted = deafened; });
    }, [deafened]);

    return (
        <ControlsContainer>
            <ControlButton onClick={toggleMuted}>
                {
                    !muted ? <BiMicrophone tw="w-8 h-8" /> : <BiMicrophoneOff tw="w-8 h-8" />
                }
            </ControlButton>
            <ControlButton onClick={toggleVideo}>
                {
                    videoOn ? <BiVideo tw="w-8 h-8" /> : <BiVideoOff tw="w-8 h-8" />
                }
            </ControlButton>
            <ControlButton onClick={toggleDeafened}>
            {
                    deafened ? <BiHeadphone tw="w-8 h-8" /> : <FaDeaf tw="w-8 h-8" />
                }
            </ControlButton>
        </ControlsContainer>
    );
}

export default ControlsOverlay;


// export function MuteButton() {
//     const [text, setText] = useState("Mute");

//     const setMic = () => {
//         if (userVideo.current.srcObject.getAudioTracks()[0].enabled) {
//             setText("Unmute");
//             userVideo.current.srcObject.getAudioTracks()[0].enabled = false;
//         } else {
//             setText("Mute");
//             userVideo.current.srcObject.getAudioTracks()[0].enabled = true;
//         }
//     };

//     return (
//         <div>
//             <button onClick={() => setMic()}>
//                 {text}
//             </button>
//         </div>
//     );
// }

// function VideoButton() {
//     const [text, setText] = useState("Turn off Video");

//     const setVideo = () => {
//         if (userVideo.current.srcObject.getVideoTracks()[0].enabled) {
//             setText("Turn on Video");
//             userVideo.current.srcObject.getVideoTracks()[0].enabled = false;
//         } else {
//             setText("Turn off Video");
//             userVideo.current.srcObject.getVideoTracks()[0].enabled = true;
//         }
//     };

//     return (
//         <div>
//             <button onClick={() => setVideo()}>
//                 {text}
//             </button>
//         </div>
//     );
// }


// function deafenMe(elem) {
//     elem.muted = true;
// }

// function undeafenMe(elem) {
//     elem.muted = false;
// }

// function DeafenButton() {
//     const [text, setText] = useState("Deafen");

//     const setAudio = () => {
//         if (!deafened) {
//             setText("Undeafen");
//             deafened = true;
//             var elems = document.querySelectorAll("video, audio");
//             [].forEach.call(elems, function (elem) { deafenMe(elem); });
//         } else {
//             setText("Deafen");
//             deafened = false;
//             var elems = document.querySelectorAll("video, audio");
//             [].forEach.call(elems, function (elem) { undeafenMe(elem); });
//         }
//     };

//     return (
//         <div>
//             <button onClick={() => setAudio()}>
//                 {text}
//             </button>
//         </div>
//     );
// }