import { useEffect, useState } from "react"
import { useApi } from "../../utils/api.js";
import { useWebSocket } from "../../contexts/WebSocketContext.jsx";

export default function EventSubStatus({className, style}) {
    const [subs, setSubs] = useState([]);
    const api = useApi();
    const { websocket } = useWebSocket();

    useEffect(()=> {
        getSubs();
        websocket.on("eventsub.connected", ()=>{getSubs()})
        websocket.on("eventsub.stopped", ()=>{setSubs([])})
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
        <div className={className}>
            <h2>Twitch Event Subscriptions</h2>
            <div className="log">
                {subs.map((entry, index)=> (
                    <div key={index} className={"m-1"}>
                        {entry.connected? "Connected:": "    Error:"} {entry.type}
                    </div>
                ))}
            </div>
        </div>
    )
}