import React, { useState, useEffect, useContext, createContext } from "react";
import firebase from "firebase/app";
import "firebase/auth";

// Add your Firebase credentials
firebase.initializeApp({
    apiKey: "AIzaSyBaopEUsgXEr5djCqkDeNrGPpM_vKhPQFI",
    authDomain: "hackhw21.firebaseapp.com",
    projectId: "hackhw21",
    storageBucket: "hackhw21.appspot.com",
    messagingSenderId: "583442620722",
    appId: "1:583442620722:web:2f0c4919e57bdee40bb72b"
});

const authContext = createContext();

// Provider component that wraps your app and makes auth object ...
// ... available to any child component that calls useAuth().
export function ProvideAuth({ children }) {
    const auth = useProvideAuth();
    return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

// Hook for child components to get the auth object ...
// ... and re-render when it changes.
export const useAuth = () => {
    return useContext(authContext);
};

// Provider hook that creates auth object and handles state
function useProvideAuth() {
    const [user, setUser] = useState(null);

    // Wrap any Firebase methods we want to use making sure ...
    // ... to save the user to state.
    const signin = (email, password) => {
        return firebase
            .auth()
            .signInWithEmailAndPassword(email, password)
            .then(response => {
                setUser(response.user);
                return response.user;
            });
    };

    const signinAnonymous = async () => {
        await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);

        const response = await firebase.auth().signInAnonymously();

        setUser(response.user)
        return response.user;
    }

    const signup = (email, password) => {
        return firebase
            .auth()
            .createUserWithEmailAndPassword(email, password)
            .then(response => {
                setUser(response.user);
                return response.user;
            });
    };

    const signout = () => {
        return firebase
            .auth()
            .signOut()
            .then(() => {
                setUser(false);
            });
    };

    const sendPasswordResetEmail = email => {
        return firebase
            .auth()
            .sendPasswordResetEmail(email)
            .then(() => {
                return true;
            });
    };

    const confirmPasswordReset = (code, password) => {
        return firebase
            .auth()
            .confirmPasswordReset(code, password)
            .then(() => {
                return true;
            });
    };

    // Subscribe to user on mount
    // Because this sets state in the callback it will cause any ...
    // ... component that utilizes this hook to re-render with the ...
    // ... latest auth object.
    useEffect(() => {
        const unsubscribe = firebase.auth().onAuthStateChanged(user => {
            if (user) {
                setUser(user);
            } else {
                setUser(false);
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        signinAnonymous();
    }, []);

    // Return the user object and auth methods
    return {
        user,
        signin,
        signup,
        signinAnonymous,
        signout,
        sendPasswordResetEmail,
        confirmPasswordReset
    };
}