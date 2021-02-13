import React from "react";
import tw, { css, styled } from "twin.macro";
import SidebarHeader from "./SidebarHeader";
import ShareSection from "./ShareSection";
import ParticipantsSection from "./ParticipantsSection";

const MainSidebarContainer = styled.div(() => [
    tw`bg-black text-white min-h-screen flex pt-20 flex-col`,
    css`width: 27.75rem;`
]);

function MainSidebar() {
    return (
        <MainSidebarContainer>
            <SidebarHeader />
            <ShareSection />
            <ParticipantsSection />
        </MainSidebarContainer>
    );
}

export default MainSidebar;