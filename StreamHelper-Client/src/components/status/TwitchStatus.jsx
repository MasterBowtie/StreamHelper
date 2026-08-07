import { useEffect, useState, useRef } from "react"
import { useApi } from "../../utils/api.js";
import { useWebSocket } from "../../contexts/WebSocketContext.jsx";
import Button from "../Button.jsx";

export default function TwitchStatus() {
    const [status, setStatus] = useState();
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [publicConnect, setPublic] = useState();
    const [privateConnect, setPrivate] = useState();
    const pollTimer = useRef(null);
    const api = useApi();
    const websocket = useWebSocket();
    
    useEffect(()=> {
        updateStatus();
        websocket.connect();

        websocket.on("twitch.connect", ()=>{updateStatus()})

        return () => websocket.disconnect();
    }, [])

    function updateStatus() {
        api.get("/api/twitch/status").then(res => {
            setStatus(res)

            if (res.authenticated) {
                setPrivate(null);
                setPublic(null);
                setDialogOpen(false);
            }
        }).finally(()=> {
            setLoading(false);
        })
    }

    function connect() {
        api.get("/api/twitch/auth/connect").then(res => {
            if (!res.success) {
                return;
            }

            if (res.data.mode === "public") {
                setDialogOpen(true);
                setPublic(res.data);
                setPrivate(null);
            } else if (res.data.mode === "private") {
                setPrivate(res.data);
                setPublic(null);
                window.open(res.data.url, "_blank")
                // TODO: trigger waiting status
            }
        })
    }

    function disconnect() {
        api.post("/api/twitch/auth/disconnect").then((res) => {

            updateStatus();
        });
    }

    if (loading) {
        return (
            <div>
                <p>Checking Twitch connection...</p>
            </div>
        )
    }

    return (
        <>
        <TwitchAuthDialog 
            open={dialogOpen}
            code={publicConnect?.userCode}
            verificationUrl={publicConnect?.url}
            waiting={true}
            onCopy={()=>navigator.clipboard.writeText(publicConnect?.userCode)}
            onCancel={()=> setDialogOpen(false)}
        />
        <h2>Twitch Status</h2>
        <div className="border-black outline-4 rounded-xl flex justify-between">
            <div className="text-left p-4">
                <p>Status: {status?.authenticated ? "Connected" : "Not Connected"}</p>
                <p>Broadcaster: {status?.broadcaster?.displayName}</p>
                <p>Twitch ID: {status?.broadcaster?.twitchId}</p>
                <p>Token Expires: {status?.broadcaster?.tokenExpires ? new Date(status.broadcaster.tokenExpires).toLocaleString(): "Unknown"}</p>
            </div>
            <div className="flex m-4 flex-col">
                <Button
                    disabled={status?.authenticated}
                    onClick={connect}
                    className={status?.authenticated ? "twitch-button disabled" : "twitch-button"}
                    text={status?.authenticated ? "Authenticated" : "Authenticate Twitch"}
                    />
                <Button
                    disabled={!status?.authenticated}
                    onClick={disconnect}
                    className={status?.authenticated ? "warning-button" : "warning-button disabled"}
                    text={"Disconnect Twitch"}
                    />
            </div>
        </div>
        </>
    )
}

function TwitchAuthDialog({
    open,
    code,
    verificationUrl,
    waiting,
    onCopy,
    onCancel
}) {
    if (!open) return null;

    return (
        <div className="dialog-backdrop">
            <div className="dialog text-center w-[420px] max-w-[90vw]">
                <h2>Connect Twitch Account</h2>
                <p>Open Twitch and enter the following activation code.</p>

                <div className="m-5 p-3 text-center text-3xl font-bold tracking-[0.2rem]">
                    {code ?? "--------"}
                </div>

                <div className="dialog-buttons">
                    <Button
                        className="twitch-button"
                        onClick={() => window.open(verificationUrl, "_blank")}
                        text={"Open Twitch"}
                        />

                    <Button className={"twitch-button"} onClick={onCopy} text={"Copy Code"}/>
                </div>

                <div className="dialog-status">
                    {waiting
                        ? "Waiting for Twitch authorization..."
                        : "Waiting to begin..."}
                </div>

                <Button className="warning-button" onClick={onCancel} text={"Cancel"}/>
            </div>
        </div>
    );
}