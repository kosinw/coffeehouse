/** @jsx jsx */
import { jsx } from '@emotion/react'
import tw, { styled, css } from 'twin.macro';
import PeerVideo from "components/MainContent/PeerVideo";
import LocalVideo from "components/MainContent/LocalVideo";
import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import io from "socket.io-client";
import { useParams } from "react-router-dom";
import getGridLayout, { getNumColumns, getNumRows } from "utils/getGridLayout";

const gridAreas = "ABCDEFGHIJ".split("");

const Grid = styled.div(({ num = 1 }) => [
    tw`grid h-full w-full`,
    css`grid-template-rows: repeat(${getNumRows(num)}, calc(${100 / getNumRows(num)}vh));`,
    css`grid-template-columns: repeat(${getNumColumns(num)}, 1fr);`,
    css`grid-template-areas: ${getGridLayout(num)};`
]);

const videoConstraints = {
    height: window.innerHeight / 2,
    width: window.innerWidth / 2
};

const constraints = {
    video: videoConstraints,
    audio: true
}

function VideoGrid() {
    const [peers, setPeers] = useState([]);
    const socketRef = useRef();
    const peersRef = useRef([]);
    const userVideo = useRef();
    const { roomID } = useParams();

    useEffect(() => {
        socketRef.current = io.connect(process.env.REACT_APP_HOST_SERVER || "24.205.76.29:64198");

        navigator.mediaDevices.getUserMedia(constraints).then(stream => {
            userVideo.current.srcObject = stream;
            socketRef.current.emit("join room", roomID);
            socketRef.current.on("all users", users => {
                const peers = [];
                users.forEach(userID => {
                    const peer = createPeer(userID, socketRef.current.id, stream);
                    peersRef.current.push({
                        peerID: userID,
                        peer
                    })
                    peers.push({
                        peerID: userID,
                        peer
                    });
                });
                setPeers(peers);

            });

            socketRef.current.on("user joined", payload => {
                const peer = addPeer(payload.signal, payload.callerID, stream);
                console.log(payload)

                peersRef.current.push({
                    peerID: payload.callerID,
                    peer,
                });

                const peerObj = {
                    peer,
                    peerID: payload.callerID
                }

                setPeers(users => [...users, peerObj])
            });

            socketRef.current.on("receiving returned signal", payload => {
                const item = peersRef.current.find(p => p.peerID === payload.id);
                item.peer.signal(payload.signal);
            })

            socketRef.current.on("user left", id => {
                const peerObj = peersRef.current.find(p => p.peerID === id);
                if (peerObj) {
                    peerObj.peer.destroy();
                }
                const peers = peersRef.current.filter(p => p.peerID !== id);
                peersRef.current = peers;
                setPeers(peers);
            })
        }).catch(err => {
            console.log(err)
        });

    }, []);

    function createPeer(userToSignal, callerID, stream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            socketRef.current.emit("sending signal", { userToSignal, callerID, signal })
        })

        return peer;
    }

    function addPeer(incomingSignal, callerID, stream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        })

        peer.on("signal", signal => {
            socketRef.current.emit("returning signal", { signal, callerID })
        })

        peer.signal(incomingSignal);

        return peer;
    }

    console.log(peersRef.current.length);

    return (
        <Grid num={peersRef.current.length + 1}>
            <LocalVideo ref={userVideo} />
            {peersRef.current.map((peer, index) =>
                <PeerVideo peer={peer.peer}
                    key={`${peer.peerID}${index}`}
                    grid={gridAreas[index + 1]}
                />
            )}
        </Grid>
    );
}

export default VideoGrid;