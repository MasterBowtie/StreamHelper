import { useEffectEvent } from "react";
import { useEffect, useState } from "react";

export default function WebSocketLog() {
    const [messages, setMessages] = useState([]);

    useEffect(()=>{

        const socket = new WebSocket("ws://localhost:3141");
        
        socket.onopen = () => {
            addMessage("CONNECTED")
        }

        socket.onmessage = (event) => {
            addMessage(event.data);
        }

        socket.onerror = (error) => {
            addMessage(`ERROR: ${error.message}`);
        }

        socket.onclose = () => {
            addMessage("DISCONNECTED");
        }
        
        return () => socket.close();
    }, [])

    function addMessage(message) {
        setMessages((prev) => [
            ...prev, {
                time: new Date().toLocaleDateString(),
                message,
            }
        ]);
    }



    return (
        <div>
            <h2>WebSocket Log</h2>
            <div style={{
                border: "1px solid #ccc",
                padding: "10px",
                fontFamily: "monospace"
            }}>
                {messages.map((entry, index)=> (
                    <div key={index}>
                        [{entry.time}] {entry.message}
                    </div>
                ))}
            </div>
        </div>
    )
}