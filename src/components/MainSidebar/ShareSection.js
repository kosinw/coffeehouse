/** @jsx jsx */
import { jsx } from '@emotion/react'
import tw from 'twin.macro';
import React, { useState } from "react";
import { HiLink } from "react-icons/hi";
import { useLocation } from 'react-router-dom'

import useClipboard from "react-use-clipboard";

function ShareSection() {
    const location = useLocation();
    const [isCopied, setCopied] = useClipboard(window.location.href);
    const [buttonText, setButtonText] = useState("Copy Link");

    function onClick() {
        setCopied();
        setButtonText("Copied!");

        setTimeout(() => setButtonText("Copy Link"), 3000);
    }

    return (
        <div tw="flex" css="border-color: #313130; border-bottom-width: 0.2px;">
            <div tw="flex flex-row justify-between items-center w-full p-5">
                <div tw="flex flex-col justify-center">
                    <p tw="inline-flex text-xs">Ready to start jamming with the boys? Send this link to your friends!</p>
                    {/* <a tw="inline-block text-xs font-bold text-blue-600 pt-2" href={window.location.href}>{window.location.href}</a> */}
                </div>
                <div tw="flex flex-col items-center ml-10 flex-shrink-0">
                    <button onClick={onClick} tw="bg-gray-500 py-2 pr-4 pl-3 rounded-full focus:outline-none hover:bg-gray-600 transition-colors cursor-pointer">
                        <span tw="flex flex-row items-center">
                            <HiLink tw="w-4 h-4" />
                            <p tw="text-sm font-bold uppercase ml-2">{buttonText}</p>
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ShareSection;