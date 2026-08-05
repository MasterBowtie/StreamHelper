import { useEffectEvent } from "react";
import { useEffect, useState } from "react";
import "../../css/chat.css";
import { useWebSocket } from "../../contexts/WebSocketContext";

export default function WebSocketLog({className, style}) {
    const [messages, setMessages] = useState([]);
    const websocket = useWebSocket();

    useEffect(()=>{
        websocket.connect();

        websocket.on("*", (message)=> {
            addMessage(message);
        });
        
        return () => { websocket.disconnect() };
    }, []);

    function addMessage(data) {
        let date = data.timestamp ? new Date(data.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString()
        setMessages((prev) => {
            const updated = [
                {
                    time: date,
                    message: data.type,
                }, ...prev
            ]
            return updated.slice(100);
        });

    }



    return (
        <div className={className} style={{width: "100%", ...style}}>
            <h2>WebSocket Log</h2>
            <div className="chat-feed flex-container border ">
                {messages.map((entry, index)=> (
                    <div key={index} style={{ margin: "2px"}}>
                        [{entry.time}] {entry.message}
                    </div>
                ))}
            </div>
        </div>
    )
}