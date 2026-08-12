import EventSubStatus from "../components/status/EventSubStatus";
import TwitchStatus from "../components/status/TwitchStatus";
import WebSocketLog from "../components/status/WebSocketLog";

export default function MainDashboard() {



    return (
        <div className="page">
            <h1 className="pt-4">Dashboard</h1>
            <TwitchStatus/>
            <div className="flex flex-row gap-5">
                <WebSocketLog className={"grow"}/>
                <EventSubStatus className={"grow"}/>
            </div>
        </div>
    )
}