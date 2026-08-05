import { useEffect, useState } from "react"
import { useApi } from "../../utils/api.js";
import "../../css/chat.css";
import { useWebSocket } from "../../contexts/WebSocketContext.jsx";

export default function EventSubStatus({className, style}) {
    const [subs, setSubs] = useState([]);
    const api = useApi();
    const websocket = useWebSocket();

    useEffect(()=> {
        getSubs();
        websocket.connect();

        websocket.on("eventsub.connected", ()=>{getSubs()})
        websocket.on("eventsub.stopped", ()=>{setSubs([])})

        return () => websocket.disconnect();
    }, []);

    function getSubs() {
        api.get('/api/twitch/eventSub/status').then(res => {
            // console.log(res);
            if (res.connected) {
                setSubs(res.subscriptions);
            }
        });
    }

    return (
        <div className={className} style={{width: "100%", ...style}}>
            <h2>Twitch Event Subscriptions</h2>
            <div className="flex-container border chat-feed">
                {subs.map((entry, index)=> (
                    <div key={index} style={{ margin: "2px"}}>
                        {entry.connected? "Connected:": "    Error:"} {entry.type}
                    </div>
                ))}
            </div>
        </div>
    )
}