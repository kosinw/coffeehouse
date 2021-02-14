import React from "react";
import tw, { css, styled } from "twin.macro";
import SidebarHeader from "./SidebarHeader";
import ShareSection from "./ShareSection";
import ParticipantsSection from "./ParticipantsSection";

const MainSidebarContainer = styled.div(() => [
    tw`bg-black text-white min-h-screen flex pt-20 flex-col overflow-hidden`,
    css`width: 26.75rem; border-color: #313130; border-right-width: 0.2px;`
]);

const SidebarList = styled.div(() => [
    tw`overflow-y-auto flex flex-col`
]);

function MainSidebar() {
    return (
        <MainSidebarContainer>
            <SidebarHeader />
            <SidebarList>
                <ShareSection />
                <ParticipantsSection />
            </SidebarList>
        </MainSidebarContainer>
    );
}

export default MainSidebar;