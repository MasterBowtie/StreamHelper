import { createContext, useContext, useRef } from "react"
import WebSocketClient from "../utils/websocket.js";

export const WebSocketContext = createContext(null);

export function useWebSocket() {
    const websocket = useContext(WebSocketContext);

    if (!websocket) {
        throw new Error("useWebSocket must be used inside WebSocketProvider.");
    }

    return websocket;
}

export function WebSocketProvider({ children }) {
    const websocket = useRef();

    if (!websocket.current) {
        websocket.current = new WebSocketClient("ws://localhost:3141")
    }

    return (
        <WebSocketContext.Provider value={websocket.current}>
            {children}
        </WebSocketContext.Provider>
    )
}