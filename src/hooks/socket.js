import React, { createContext, useContext, useState } from "react";
import { useCallbackRef, createCallbackRef } from "use-callback-ref";

const socketContext = createContext(null);

export function useSocket() {
    return useContext(socketContext);
}

function useProvideSocket() {
    const [,forceUpdate] = useState();
    const socketRef = useCallbackRef(null, () => forceUpdate());

    return socketRef;
}

export function ProvideSocket({ children }) {
    const provider = useProvideSocket();

    return <socketContext.Provider value={provider}>{children}</socketContext.Provider>;
}