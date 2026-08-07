import { useEffectEvent } from "react";
import { useEffect, useState } from "react";
import { useWebSocket } from "../../contexts/WebSocketContext";

export default function WebSocketLog({className, style}) {
    const [messages, setMessages] = useState([]);
    const websocket = useWebSocket();

    useEffect(()=>{
        websocket.connect();

        websocket.on("*", (message)=> {
            let date = new Date(message.timestamp).toLocaleTimeString();
            setMessages(current => {
                const updated = [
                    {
                        time: date,
                        message: message.type
                    },
                    ...current
                ];

                return updated.slice(0, 100);
            });
        });
        
        return () => { websocket.disconnect() };
    }, []);

    return (
        <div className={`${className}`}>
            <h2>WebSocket Log</h2>
            <div className="log">
                {messages.map((entry, index)=> (
                    <div key={index} style={{ margin: "2px"}}>
                        [{entry.time}] {entry.message}
                    </div>
                ))}
            </div>
        </div>
    )
}