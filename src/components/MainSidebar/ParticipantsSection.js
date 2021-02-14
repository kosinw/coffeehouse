/** @jsx jsx */
import { jsx } from '@emotion/react'
import tw, { css, styled } from 'twin.macro';
import React, { useState } from "react";
import { useParticipants } from "hooks/participants";

const StatusIndicator = styled.span(({ status }) => [
    tw`relative inline-flex rounded-full h-3 w-3 `,
    status === "online" && tw`bg-green-500`,
    status === "offline" && tw`bg-red-500`
]);

// TODO(kosi): Add functionality, onClick, kicks participant
function ParticipantProfile({ profile }) {
    return (
        <div tw="flex">
            <div tw="flex flex-row w-full p-5 justify-between">
                <div tw="flex flex-row">
                    <span tw="relative inline-flex">
                        <img tw="inline-flex h-12 w-12 rounded-full" src={profile.profileUrl} alt={`${profile.displayName} photo`} />
                        <span tw="flex absolute h-3 w-3 top-1 right-1 -mt-1 -mr-1">
                            <StatusIndicator status={profile.status} />
                        </span>
                    </span>
                    <div tw="flex flex-col ml-4 justify-between">
                        <span tw="inline-flex text-sm font-light capitalize">{profile.status}</span>
                        <span tw="inline-flex text-base font-bold">{`${profile.displayName}${profile.roommaster ? ` (Roommaster)` : ``}`}</span>
                    </div>
                </div>
                <div tw="flex py-2">
                    <button tw="flex items-center rounded-full font-bold text-lg border-white border-2 px-5 transition-colors duration-150 ease-in-out focus:outline-none hover:(bg-white text-black)">
                        <span tw="inline-block font-bold tracking-tight text-sm uppercase">Kick</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

function SelfParticipantProfile(props) {
    return <ParticipantProfile {...props} />;
}

function ParticipantProfiles({ profiles }) {
    const { self } = useParticipants();

    console.log(self);

    return (
        <div tw="flex flex-col">
            {!!self && <SelfParticipantProfile profile={self} />}
            {profiles.map((profile) => (<ParticipantProfile profile={profile} key={profile.id} />))}
        </div>
    );
}

function ParticipantsSection() {
    const { otherParticipants: profiles } = useParticipants();

    return (
        <div tw="flex" css="border-color: #313130; border-bottom-width: 0.2px;">
            <div tw="flex flex-col w-full">
                <div css="background-color: #1E1F1F;" tw="flex w-full py-3 px-5">
                    <h3 tw="text-xs font-bold uppercase leading-3">Participants</h3>
                </div>
                <ParticipantProfiles profiles={profiles} />
            </div>
        </div>
    );
}

export default ParticipantsSection;