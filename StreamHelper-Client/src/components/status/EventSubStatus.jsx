import { useEffect, useState } from "react"
import { useApi } from "../../utils/use_api";

export default function EventSubStatus({className, style}) {
    const [subs, setSubs] = useState([]);
    const api = useApi();

    useEffect(()=> {
        api.get('https://localhost:3141/twitch/eventSub/status').then(res => {
            console.log(res);
        });
    }, []);

    return (
        <div>
            {subs.map((sub) => {
                <p>{sub}</p>
            })}
        </div>
    )
}