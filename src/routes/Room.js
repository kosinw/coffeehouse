import React from "react";
import tw from "twin.macro";
import MainSidebar from "components/MainSidebar/MainSidebar";
import MainContent from "components/MainContent/MainContent";
import { ProvideParticipants } from "hooks/participants";

const MainContainer = tw.div`h-screen w-screen flex flex-row bg-black`;

function Room() {
    return (
        <ProvideParticipants>
            <MainContainer>
                <MainSidebar />
                <MainContent />
            </MainContainer>
        </ProvideParticipants>
    );
}

export default Room;
