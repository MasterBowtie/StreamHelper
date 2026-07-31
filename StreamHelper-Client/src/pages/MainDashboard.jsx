import EventSubStatus from "../components/status/EventSubStatus";
import TwitchStatus from "../components/status/TwitchStatus";
import WebSocketLog from "../components/status/WebSocketLog";

export default function MainDashboard() {



    return (
        <div className="title">
            <h1>Stream Helper Dashboard</h1>
            <TwitchStatus/>
            <div className="flex-container" style={{flexDirection: "row"}}>
                <WebSocketLog style={{minHeight: "200px"}}/>
                <EventSubStatus/>
            </div>
        </div>
    )
}