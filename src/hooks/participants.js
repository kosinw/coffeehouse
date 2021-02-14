import React, { createContext, useContext, useState, useEffect } from "react";
import { getGravatarUri } from "utils/gravatar";
import { useAuth } from "hooks/firebase";

import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';
import { setUseProxies } from "immer";

const ParticipantContext = createContext({ otherParticipants: [], self: null });

// TODO(kosi): Check with firebase if auth or not
export class Participant {
    constructor(id, status, displayName, photoURL) {
        this.id = id;
        this.status = status;
        this.displayName = displayName;
        this.profileUrl = photoURL;
    }
}

export function useParticipants() {
    return useContext(ParticipantContext);
}

function useProvideParticipants() {
    const [otherParticipants, setOtherParticipants] = useState([]);
    const [self, setSelf] = useState(null);

    let { user, setUser } = useAuth();

    // TODO(kosi): Change this from peer id to firebase auth id
    const updateParticipants = (profiles) => {
        const newP = profiles.map(profile => new Participant(profile.userID, "online", profile.displayName, profile.photoURL));
        setOtherParticipants(newP);
    }

    useEffect(() => {
        if (!!user) {
            // If user doesn't have display name, update their profile with a random one
            // and profileimage
            let { displayName, photoURL, uid } = user;

            if (!!user && !user.displayName) {
                displayName = uniqueNamesGenerator({
                    dictionaries: [adjectives, animals],
                    separator: " ",
                    style: "capital"
                })

                photoURL = getGravatarUri(user.uid)

                user.updateProfile({
                    displayName: displayName,
                    photoURL: photoURL
                });

                setUser(user);
            }

            setSelf(new Participant(uid, "online", displayName, photoURL));
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