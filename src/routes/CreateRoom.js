import React from "react";

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

const CreateRoom = (props) => {
    function create() {
        const id = makeid(6);
        props.history.push(`/room/${id}`);
    }

    function join() {
        var roomid = document.getElementById('room-code').value
        props.history.push(`/room/${roomid}`)
    }

    return (
        <>
        <button onClick={create}>Create Room</button>
        <button onClick={join}>Join Room</button>
        <input id='room-code' class="w3-input" type="text" placeholder="ABCDEF"></input>
        </>
    );
};

export default CreateRoom;
