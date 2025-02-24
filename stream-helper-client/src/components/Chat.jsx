
import { useEffect, useState } from 'react';
import { io } from "socket.io-client";


function Chat () {
    const [knownCheermotes, setCheermotes] = useState();
    const [knownBadges, setBadges] = useState();
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
            // console.log(data);
            setMessages(data);
        })
      },[socket])

    return (
        <table style={{width: "400px", fontWeight: "bold", color: "white", fontFamily: "Arial", backgroundColor: "rgba(0, 0, 0, 0.35)", position: "absolute", bottom: "10px"}}>
            <tbody>
            {messages.map((event, index) => {})}
            </tbody>
        </table>
    )
}

export default Chat;