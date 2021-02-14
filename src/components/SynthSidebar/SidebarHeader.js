/** @jsx jsx */
import { jsx } from '@emotion/react'
import tw from 'twin.macro';
import { HiChevronRight } from "react-icons/hi";
import { BiMusic } from "react-icons/bi";
import { Link } from "react-router-dom";

const LogoContainer = tw.div`flex flex-row items-center`;
const IconContainer = tw.div`flex flex-row items-center`;

function SidebarHeader({ hide }) {
    return (
        <div css="border-color: #313130; border-bottom-width: 0.2px;" tw="flex top-0 left-0">
            <div tw="flex flex-row justify-between items-center w-full p-5">
                <LogoContainer>
                    <Link tw="inline-flex" to="/">
                        <BiMusic tw="w-8 h-8" />
                        <span tw="pl-4 font-black text-2xl">Synthesizer</span>
                    </Link>
                </LogoContainer>
                <IconContainer>
                    <button onClick={hide} tw="w-10 h-10 cursor-pointer flex items-center justify-center focus:outline-none">
                        <HiChevronRight tw="w-full h-full block" />
                    </button>
                </IconContainer>
            </div>
        </div>
    );
}

export default SidebarHeader;