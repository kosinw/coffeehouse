/** @jsx jsx */
import { jsx } from "@emotion/react";
import tw, { css, styled } from "twin.macro";
import React, { useState } from "react";
import SidebarHeader from "./SidebarHeader";
import ShareSection from "./ShareSection";
import ParticipantsSection from "./ParticipantsSection";
import { BiCoffee } from "react-icons/bi";

const MainSidebarContainer = styled.div(({ visible }) => [
    tw`bg-black text-white min-h-screen flex flex-col overflow-hidden`,
    css`width: 26.75rem; border-color: #313130; border-right-width: 0.2px;`,
    css`transition: margin-left 500ms cubic-bezier(0.175, 0.885, 0.32, 1.275) 0s`,
    !visible ? css`margin-left: -26.75rem;` : ""
]);

const SidebarList = styled.div(() => [
    tw`overflow-y-auto flex flex-col`
]);

const HiddenContainer = styled.div(({ visible }) => [
    tw`z-50`,
    visible ? tw`hidden` : ""
]);

function SidebarShowButton({ show, visible }) {
    return (
        <HiddenContainer visible={visible}>
            <div tw="fixed top-10 left-10 flex items-center p-5 rounded-full bg-black bg-opacity-90">
                <button onClick={show} tw="focus:outline-none text-white">
                    <BiCoffee tw="w-8 h-8" />
                </button>
            </div>
        </HiddenContainer>
    );
}

function MainSidebar() {
    const [visible, setVisible] = useState(true);

    return (
        <MainSidebarContainer visible={visible}>
            <SidebarHeader hide={() => setVisible(false)} />
            <SidebarList>
                <ShareSection />
                <ParticipantsSection />
            </SidebarList>
            <SidebarShowButton visible={visible} show={() => setVisible(true)} />
        </MainSidebarContainer>
    );
}

export default MainSidebar;