import React from "react";
import tw from "twin.macro";
import MainSidebar from "components/MainSidebar/MainSidebar";
import MainContent from "components/MainContent/MainContent";
import { ProvideParticipants } from "hooks/participants";
import SynthSidebar from "components/SynthSidebar/SynthSidebar";

const MainContainer = tw.div`h-screen w-screen flex flex-row bg-black`;

function Room() {
    return (
        <MainContainer>
            <ProvideParticipants>
                <MainContainer>
                    <MainSidebar />
                    <MainContent />
                    <SynthSidebar />
                </MainContainer>
            </ProvideParticipants>
        </MainContainer>
    );
}

export default Room;
