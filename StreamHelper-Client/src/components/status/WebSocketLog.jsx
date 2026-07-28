import { useEffectEvent } from "react";
import { useEffect, useState } from "react";

export default function WebSocketLog({className, style}) {
    const [messages, setMessages] = useState([]);

    useEffect(()=>{

        const socket = new WebSocket("ws://localhost:3141");
        
        socket.onopen = () => {
            addMessage({type: "CONNECTED"})
        }

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            addMessage(data);
        }

        socket.onerror = (error) => {
            addMessage(`ERROR: ${error.message}`);
        }

        socket.onclose = () => {
            addMessage({type: "DISCONNECTED"});
        }
        
        return () => socket.close();
    }, [])

    function addMessage(data) {
        let date = data.timestamp ? new Date(data.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString()
        setMessages((prev) => [
            {
                time: date,
                message: data.type,
            }, ...prev
        ]);
    }



    return (
        <div className={className} style={{width: "100%", ...style}}>
            <h2>WebSocket Log</h2>
            <div className="flex-container border" style={{
                margin: "10px",
                flexDirection: "column",
                fontFamily: "monospace",
                textAlign: "left",
                alignContent: "start"
            }}>
                {messages.map((entry, index)=> (
                    <div key={index} style={{ margin: "2px"}}>
                        [{entry.time}] {entry.message}
                    </div>
                ))}
            </div>
        </div>
    )
}