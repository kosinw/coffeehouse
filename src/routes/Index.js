import React from "react";
import tw, { css, styled } from "twin.macro";
import MainSidebar from "../components/MainSidebar/MainSidebar";

const MainContainer = tw.div`min-h-screen flex flex-row`;

function Index() {
    return (
        <MainContainer>
            <MainSidebar />
        </MainContainer>
    );
}

export default Index;