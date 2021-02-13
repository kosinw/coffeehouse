import React from "react";
import tw from "twin.macro";
import MainSidebar from "components/MainSidebar/MainSidebar";
import MainContent from "components/MainContent/MainContent";

const MainContainer = tw.div`h-screen w-screen flex flex-row`;

function Index() {
    return (
        <MainContainer>
            <MainSidebar />
            <MainContent />
        </MainContainer>
    );
}

export default Index;