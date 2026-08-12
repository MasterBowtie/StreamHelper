import { useEffectEvent } from "react";
import { useEffect, useState } from "react";
import { useWebSocket } from "../../contexts/WebSocketContext";

export default function WebSocketLog({className, style}) {
    const {messages} = useWebSocket();

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