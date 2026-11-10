import { useState, useEffect} from "react";
import { useWebSocket } from "../contexts/WebSocketContext";

export default function AdBreak() {
    const {websocket, connected }= useWebSocket();

    const [currentTime, setTime] = useState(Date.now());
    const [endTime, setEnd] = useState(null);
    const [adRunning, setAd] = useState(false);
    
    const alert = useRef(null);
    const timeout = useRef(null);

    useEffect(()=> {
        alert.current(new Audio("No Wait Wait!.mp3"))
        alert.current.preload = "auto";
    }, [])

    useEffect(()=> {
        if (!adRunning) return;

        const interval = setInterval(()=> {
            const now = Date.now(); 
            setTime(now);

            if (now >= endTime) {
                setAd(false);
                setEnd(null);
            }
        }, 250);

        return () => clearInterval(interval)
    }, [adRunning, endTime]);

    useEffect(()=> {
        if (!connected) return;

        const callback = (data) => {
            const duration = parseInt(data.payload.duration_seconds, 10);

            if (!Number.isFinite(duration) || duration <= 0) return;

            clearTimeout(timeout.current);

            setTime(Date.now());
            setEnd(Date.now() + duration * 1000);
            setAd(true);

            if (alert.current) {
                alert.current.currentTime = 0;
                alert.current.play().catch(console.error);
            }
        };

        websocket.on('twitch.ad.start', callback);

        return () => {
            websocket.off('twitch.ad.start', callback);
            clearTimeout(timeout.current);
        }
    },[connected, websocket]);

    const remaining = endTime ? Math.max(0, Math.ceil((endTime = currentTime) / 1000)) : 0;

    return (
    <div id="adTimer" hidden={!adRunning}>
        <h2 className="adTitle">Ad Break!</h2>
        <h2  className="adTitle title timer" style={{top: "30%"}} >
            {Math.floor(remaining/60)}:{String(remaining % 60).padStart(2, "0")}
        </h2>
    </div>
    )
}