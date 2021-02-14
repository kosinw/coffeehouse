/** @jsx jsx */
import { jsx } from '@emotion/react'
import tw, { css, styled } from 'twin.macro';
import { useParticipants } from "hooks/participants";
import { Input } from "@chakra-ui/react";
import { useState, useEffect, useCallback } from "react";
import { useSocket } from "hooks/socket";
import md5 from "md5";

function Message({ sender, message }) {
    return { text: sender + ": " + message, profileURL: "https://cdn.discordapp.com/attachments/809157007348465664/810345209720340520/roboticon.png" };
}

function NewMessage({ sender, message }) {
    return {
        key: md5(sender) + md5(message) + md5(new Date().getMilliseconds()),
        text: message,
        profileURL: sender.photoURL,
        timeRecieved: new Date(),
        sender: sender.displayName
    };
}

function ChatInput({ setChat }) {
    const socketRef = useSocket();
    const [message, setMessage] = useState("");

    function handleSubmit(e) {
        e.preventDefault();

        if (message === "" || !socketRef.current) {
            return;
        }

        if (message == "-help") {
            setChat(chat => [...chat, Message({
                sender: "List of Commands",
                message: "-play [song title]\n-play [song title]\n-queue [song title]\n-skip",
                isYou: false
            })]);
        }
        else {
            if (message == "-skip") {
                socketRef.current.emit("skip", 0);
            }
            else if (message.toLowerCase().substring(0, 6) == "-play ") {
                if (message.substring(6) != "") socketRef.current.emit("getLink", JSON.stringify({
                    search: message.substring(6),
                    type: "linkFirst"
                }));
            }
            else if (message.toLowerCase().substring(0, 7) == "-queue ") {
                if (message.substring(7) != "") socketRef.current.emit("getLink", JSON.stringify({
                    search: message.substring(6),
                    type: "linkEnd"
                }));
            }
            //send message
            socketRef.current.emit("sending message", message);
            // setChat(chat => [...chat, Message({
            //     sender: "You",
            //     message: message,
            //     isYou: true
            // })]);
        }

        setMessage("");
    }

    return (
        <form tw="w-full" onSubmit={handleSubmit}>
            <Input value={message} onChange={e => setMessage(e.target.value)} borderColor="#313130" h={9} w="100%" placeholder="Message..." />
        </form>
    );
}

function ChatView({ chat }) {
    console.log(chat);
    return (
        <div tw="overflow-y-auto">
            <div tw="p-5 flex flex-col">
                {chat.map((message) => (
                    <span tw="flex flex-row py-2">
                        <div tw="flex items-center">
                            <img tw="w-12 h-12 rounded-full" src={message.profileURL} alt={`${message.sender} photo`} />
                        </div>
                        <div tw="ml-4 flex flex-col items-start text-xs text-left">
                            <span tw="font-bold">{message.sender}</span>
                            <p tw="mt-1 text-sm" key={message.key}>{message.text}</p>
                        </div>
                    </span>
                ))}
            </div>
        </div>
    );
}

function ChatSection() {
    const [chat, setChat] = useState([]);
    const socketRef = useSocket();
    const [init, setInit] = useState(false);
    const [update, forceUpdate] = useState();

    let interval;

    useEffect(() => {
        // hacky as fuck
        if (init === false) {
            interval = setInterval(() => forceUpdate(update + 1), 500)
        }

        if (!!socketRef.current && !init) {
            clearInterval(interval)
            socketRef.current.on("receiving message", messageData => {
                const data = JSON.parse(messageData);

                console.log(data.sender);

                let newSender = JSON.parse(data.sender);

                if (!newSender) {
                    setChat(chat => [...chat, Message({
                        sender: data.sender,
                        message: data.message,
                        isYou: false
                    })]);
                } else {
                    setChat(chat => [...chat, NewMessage({
                        sender: newSender,
                        message: data.message,
                        isYou: false
                    })]);
                }
            });

            setInit(true);
        }
    });


    return (
        <div tw="flex h-full">
            <div tw="flex flex-col justify-between w-full">
                <div tw="flex flex-col">
                    <div css="background-color: #1E1F1F;" tw="flex w-full py-3 px-5">
                        <h3 tw="text-xs font-bold uppercase leading-3">Chat</h3>
                    </div>
                    <ChatView chat={chat} />
                </div>
                <div tw="flex items-center" css="background-color: #1E1F1F;" tw="p-2">
                    <ChatInput setChat={setChat} />
                </div>
            </div>
        </div>
    );
}

export default ChatSection;