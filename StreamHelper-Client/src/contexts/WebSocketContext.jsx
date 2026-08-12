import { createContext, useContext, useRef, useEffect, useState, useMemo } from "react"
import WebSocketClient from "../utils/websocket.js";

export const WebSocketContext = createContext(null);

export function useWebSocket() {
    const context = useContext(WebSocketContext);

    if (!context) {
        throw new Error("useWebSocket must be used inside WebSocketProvider.");
    }

    return context;
}

export function WebSocketProvider({ children }) {
    const websocketRef = useRef();
    const [messages, setMessages] = useState([]);

    useEffect(()=> {
        websocketRef.current = new WebSocketClient("ws://localhost:3141")
    
        const callback = (message) => {
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
        }

        websocketRef.current.on("*", callback);
        websocketRef.current.connect()

        return () => {
            websocketRef.current.off("*", callback);
            websocketRef.current.disconnect();
            websocketRef.current = null;
        }
    }, [])

    const websocket = useMemo (() => ({
        connect() {
            websocketRef.current?.connect();
        },
        disconnect() {
            websocketRef.current?.disconnect();
        },
        on(type, callback) {
            websocketRef.current?.on(type, callback);
        },
        off(type, callback) {
            websocketRef.current?.off(type, callback);
        }
    }), []);

    return (
        <WebSocketContext.Provider value={{websocket, messages}}>
            {children}
        </WebSocketContext.Provider>
    )
}