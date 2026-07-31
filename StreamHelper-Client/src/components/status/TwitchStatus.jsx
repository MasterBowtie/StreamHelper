import { useEffect, useState, useRef } from "react"
import { useApi } from "../../utils/use_api.js";
import "../../css/twitchAuth.css";

export default function TwitchStatus() {
    const [status, setStatus] = useState();
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [publicConnect, setPublic] = useState();
    const [privateConnect, setPrivate] = useState();
    const pollTimer = useRef(null);
    const api = useApi();
    
    useEffect(()=> {
        updateStatus();
    }, [])

    function updateStatus() {
        api.get("/api/twitch/status").then(res => {
            setStatus(res)

            if (res.authenticated) {
                clearInterval(pollTimer.current);
                pollTimer.current = null;

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

            if (!pollTimer.current) {
                pollTimer.current = setInterval(updateStatus, 1000);
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
        <h2>Twitch Status:</h2>
        <div className="border flex-container" style={{justifyContent: "space-between"}}>
            <div style={{textAlign: "left", padding: "10px"}}>
                <p>Status: {status?.authenticated ? "Connected" : "Not Connected"}</p>
                <p>Broadcaster: {status?.broadcaster?.displayName}</p>
                <p>Twitch ID: {status?.broadcaster?.twitchId}</p>
                <p>Token Expires: {status?.broadcaster?.tokenExpires ? new Date(status.broadcaster.tokenExpires).toLocaleString(): "Unknown"}</p>
            </div>
            <div style={{display:"flex", margin: "20px", flexDirection: "column"}}>
                <button
                    disabled={status?.authenticated}
                    onClick={connect}
                    className={status?.authenticated ? "auth-button disabled" : "auth-button"}>
                    {status?.authenticated ? "Authenticated" : "Authenticate Twitch"}
                </button>
                <button
                    disabled={!status?.authenticated}
                    onClick={disconnect}
                    className={status?.authenticated ? "disconnect-button" : "disconnect-button disabled"}>
                    Disconnect Twitch
                </button>
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
            <div className="dialog">
                <h2>Connect Twitch Account</h2>
                <p>Open Twitch and enter the following activation code.</p>

                <div className="activation-code">
                    {code ?? "--------"}
                </div>

                <div className="dialog-buttons">
                    <button
                        className="primary-button"
                        onClick={() => window.open(verificationUrl, "_blank")}>
                        Open Twitch
                    </button>

                    <button onClick={onCopy}>
                        Copy Code
                    </button>
                </div>

                <div className="dialog-status">
                    {waiting
                        ? "Waiting for Twitch authorization..."
                        : "Waiting to begin..."}
                </div>

                <button className="cancel-button" onClick={onCancel}>
                    Cancel
                </button>
            </div>
        </div>
    );
}