import EventSubStatus from "../components/status/EventSubStatus";
import WebSocketLog from "../components/status/WebSocketLog";

export default function MainDashboard() {



    return (
        <div className="title">
            <h1>Stream Helper Dashboard</h1>
            <div className="flex-container" style={{flexDirection: "row"}}>
                <WebSocketLog style={{minHeight: "200px"}}/>
                <div style={{width: "100%"}}>
                    <h2>EventSub Subscriptions</h2>
                    <div className="flex-container border">
                        <EventSubStatus/>
                    </div>
                </div>
            </div>
        </div>
    )
}