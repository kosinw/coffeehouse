/** @jsx jsx */
import { jsx } from "@emotion/react";
import tw, { css, styled } from "twin.macro";
import { useState } from "react";
import { BiMusic } from "react-icons/bi";
import React from "react";
import SidebarHeader from "components/SynthSidebar/SidebarHeader";
import SynthGrid from "components/SynthSidebar/SynthGrid";

const SidebarList = styled.div(() => [
    tw`overflow-y-auto flex flex-col`
]);

const SynthSidebarContainer = styled.div(({ visible }) => [
    tw`bg-black text-white min-h-screen flex flex-col overflow-hidden`,
    css`width: 26.75rem; border-color: #313130; border-right-width: 0.2px;`,
    css`transition: margin-right 500ms cubic-bezier(0.175, 0.885, 0.32, 1.275) 0s`,
    !visible ? tw`hidden` : "",
    !visible ? css`margin-right: 26.75rem;` : ""
]);


const HiddenContainer = styled.div(({ visible }) => [
    tw`z-50`,
    visible ? tw`hidden` : ""
]);

function SidebarShowButton({ show, visible }) {
    return (
        <HiddenContainer visible={visible}>
            <div tw="fixed top-10 right-10 flex items-center p-5 rounded-full bg-black bg-opacity-90">
                <button onClick={show} tw="focus:outline-none text-white">
                    <BiMusic tw="w-8 h-8" />
                </button>
            </div>
        </HiddenContainer>
    );
}

function SynthSidebar() {
    const [visible, setVisible] = useState(true);

    return (
        <>
            <SidebarShowButton visible={visible} show={() => setVisible(true)} />
            <SynthSidebarContainer visible={visible}>
                <SidebarHeader hide={() => setVisible(false)} />
                <SidebarList tw="h-full">
                    <SynthGrid />
                </SidebarList>
            </SynthSidebarContainer>
        </>
    );
}

export default SynthSidebar;