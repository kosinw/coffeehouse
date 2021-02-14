import React, { createContext, useContext, useState, useEffect } from "react";
import { getGravatarUri } from "utils/gravatar";
import { useAuth } from "hooks/firebase";

const ParticipantContext = createContext({ otherParticipants: [], self: null });

// TODO(kosi): Check with firebase if auth or not
export class Participant {
    constructor(id, status, displayName) {
        this.id = id;
        this.status = status;
        this.displayName = displayName;
        this.profileUrl = getGravatarUri(this.id);
    }
}

export function useParticipants() {
    return useContext(ParticipantContext);
}

function useProvideParticipants() {
    const [otherParticipants, setOtherParticipants] = useState([]);
    const [self, setSelf] = useState(null);
    const { user } = useAuth();

    // TODO(kosi): Change this from peer id to firebase auth id
    const updateParticipants = (peers) => {
        const newP = peers.map(peer => new Participant(peer.peerID, "online", "John Smith"));
        setOtherParticipants(newP);
    }

    useEffect(() => {
        if (!!user) {
            setSelf(new Participant(user.uid, "online", user.displayName, getGravatarUri(user.uid)));
        }
    }, [user]);

    return {
        otherParticipants,
        updateParticipants,
        self
    };
}

export function ProvideParticipants({ children }) {
    const provider = useProvideParticipants();

    return <ParticipantContext.Provider value={provider}>{children}</ParticipantContext.Provider>;
}