import { useEffect, useState } from 'react';
import { io } from "socket.io-client";
import { useWebSocket } from '../contexts/WebSocketContext';
import { ChatMessage } from '../components/ChatMessage';


function Chat () {
    const {websocket, connected} = useWebSocket();
    const [messages, setMessages] = useState([]);

    useEffect(()=> {
        if (!connected) return;

        const newCallback = (message) => {
            setMessages(current => ([message.payload, ...current].slice(0,100)));
        };
        websocket.on('twitch.chat.message', newCallback);

        const deleteCallback = (messageId) => {
            setMessages(current => (
                current.filter(message => message.message_id !== messageId.payload)
            ));
        };
        websocket.on('twitch.chat.delete', deleteCallback);

        const clearCallback = () => {
            setMessages([]);
        };
        websocket.on('twitch.chat.clear', clearCallback);
        
        const clearUserCallback = (userId) => {
            setMessages(current => (
                current.filter(message => message.chatter_user_id !== userId.payload)));
        };
        websocket.on('twitch.chat.clear_user', clearUserCallback);
        
        return () => {
            websocket.off('twitch.chat.message', newCallback);
            websocket.off('twitch.chat.delete', deleteCallback);
            websocket.off('twitch.chat.clear', clearCallback);
            websocket.off('twitch.chat.clear_user', clearUserCallback);
        }
    }, [connected]);

    return (
        <div className='h-full overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0%,black_25%,black_100%)]
    [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_25%,black_100%)]'>

            <div className='absolute inset-0 flex flex-col-reverse justify-start'>
                {messages.map(entry => (
                    <ChatMessage key={entry.message_id} message={entry}/>
                ))}
            </div>
        </div>
    )
}

export default Chat;