import React, { useEffect } from "react";
import { useAuth } from "hooks/firebase";

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const CreateRoom = (props) => {
    const { signinAnonymous } = useAuth();

    function create() {
        const id = makeid(6);
        props.history.push(`/room/${id}`);
    }

    return (
        <>
            <button onClick={create}>Create Room</button>
        </>
    );
};

export default CreateRoom;
