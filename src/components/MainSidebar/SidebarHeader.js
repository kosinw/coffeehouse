/** @jsx jsx */
import { jsx } from '@emotion/react'
import tw from 'twin.macro';
import React from "react";
import Logo from "assets/images/logo.png";
import { HiChevronLeft } from "react-icons/hi";

const LogoContainer = tw.div`flex flex-row items-center`;
const IconContainer = tw.div`flex flex-row items-center`;

function SidebarHeader() {
    return (
        <div css="width: 27.75em; border-color: #313130; border-bottom-width: 0.2px;" tw="fixed flex top-0 left-0">
            <div tw="flex flex-row justify-between items-center w-full p-5">
                <LogoContainer>
                    <img tw="w-8" src={Logo} alt="Coffehouse logo" />
                    <span tw="pl-4 font-black text-3xl">Coffeehouse</span>
                </LogoContainer>
                <IconContainer>
                    <button tw="w-10 h-10 cursor-pointer flex items-center justify-center focus:outline-none">
                        <HiChevronLeft tw="w-full h-full block" />
                    </button>
                </IconContainer>
            </div>
        </div>
    );
}

export default SidebarHeader;