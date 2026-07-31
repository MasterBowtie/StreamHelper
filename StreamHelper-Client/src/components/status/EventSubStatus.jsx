import { useEffect, useState } from "react"
import { useApi } from "../../utils/use_api";
import "../../css/chat.css";

export default function EventSubStatus({className, style}) {
    const [subs, setSubs] = useState([]);
    const api = useApi();

    useEffect(()=> {
        setSubs([]);
        api.get('/api/twitch/eventSub/status').then(res => {
            if (res.connected) {
                setSubs(res.subscriptions);
            }
        });
    }, []);

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