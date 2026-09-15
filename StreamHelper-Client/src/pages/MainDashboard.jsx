import EventSubStatus from "../status/EventSubStatus";
import TwitchStatus from "../status/TwitchStatus";
import WebSocketLog from "../status/WebSocketLog";

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