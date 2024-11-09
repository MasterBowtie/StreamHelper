
import { useEffect, useState } from 'react';
import { io } from "socket.io-client";

// Learn to connect to Twitch using Websockets
const url = "wss://eventsub.wss.twitch.tv/ws";


function Chat () {
    const [messages, setMessages] = useState([]);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        let s = io();
        setSocket(s);
        return () => { s.disconnect()}
      },[])
    
      useEffect(() => {
        if(!socket) return;
        socket.on("channel.chat.message", (data)=> {
            console.log(data);
            setMessages(data);
        })
      },[socket])

    //   let { badges, color } = event;
    //   let { broadcaster_user_id, broadcaster_user_login, broadcaster_user_name } = event;
    //   let { chatter_user_id, chatter_user_login, chatter_user_name } = event;
    //   let { cheer, channel_points_custom_reward_id, message_type } = event;
    //   let { message_id, message, reply } = event;

    //   let { text, fragments } = message;

    return (
        <>
            <div>
                {messages.map((value, index) => (
                    <div key={index}>{value.event.message.text}</div>
                )
                )}
            </div>
        </>
    )
}

export default Chat;