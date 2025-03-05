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
            setMessages(data);
            console.log(messages);

        })
      },[socket])

    return (
        <div style={{width: "400px", height: "600px", fontWeight: "bold", color: "white", fontFamily: "Arial", backgroundColor: "rgba(0, 0, 0, 1)", position: "absolute", bottom: "10px"}}>
            <div><p>Chat Testing</p></div>
            {messages.map((data)=> {
                let message = data.message.text;
                console.log("Message: ", message)
                if (message.startsWith("!")) {
                    return (<></>);
                }
                return (<div key={data.key} style={{display: "inline", color: "white"}}><p>
                    <span style={{color: data.color, }}>{data.username}: </span>{message}
                </p>
                </div>)
            })}
        </div>
    )
}

export default Chat;