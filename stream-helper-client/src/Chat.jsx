
import { useEffect, useState } from 'react';

// Learn to connect to Twitch using Websockets
const url = "wss://eventsub.wss.twitch.tv/ws";


function Chat () {
    const [messages, setMessages] = useState([]);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        let s = new WebSocket(url);
        s.onmessage = (event) => {
            // console.log(event);
        }
        s.onopen = (event) => {
            console.log(`Socket connected to ${url}`)
        }
        s.onclose = (event) => {
            console.log(`Socket closed`);
        }

        setSocket(s);
        return () => {
          s.close();
        }
      },[])
    
      useEffect(() => {
        if(!socket) return;
        console.log(socket);
      },[socket])


    return (
        <>
            Chat
        </>
    )
}

export default Chat;