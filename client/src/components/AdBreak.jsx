import { useState } from "react";
import { useEffect } from "react";
import { io } from "socket.io-client";

export default function AdBreak() {
    const [socket, setSocket] = useState();
    const [currentTime, setTime] = useState();
    const [endTime, setEnd] = useState();
    const [alert, setAlert] = useState();

    useEffect(()=> {
        let s = io();
        setSocket(s);
        s.emit("create", "webhook");
        let audio = new Audio("src/assets/AdStart.mp3")
        audio.autoplay = false;
        audio.loop = false;
        audio.volume = 0.5;
        setAlert(audio);
        setInterval(()=> {
            setTime(Date.now())
        }, 1000);
        return () => { s.disconnect() }
    },[])

    useEffect(() => {
        if (!socket) return;
        socket.on("channel.ad_break.begin", (data)=> {
            startAds(data);
        })
    },[socket])

    function startAds(data) {
        let div = document.getElementById("adTimer");
        div.removeAttribute("hidden");
        let duration = parseInt(data.duration_seconds);
        let seconds = duration % 60;
        let minutes = Math.floor(duration/60);
        console.log(`Duration: ${minutes}:${seconds}`);
        setEnd(Date.now() + (duration * 1000));
        if (alert) alert.play();
        setTimeout(()=> {
            if (alert) alert.play();
            div.hidden = true;
        }, duration * 1000);
    }

    return (
    <div id="adTimer" hidden onClick={(event) => {
            startAds({duration_seconds: "15"})
        }}>
        <h2 className="adTitle title">Ad Break!</h2>
        <h2  className="adTitle title timer" style={{top: "30%"}} >
            {endTime && endTime > currentTime? Math.floor((endTime - currentTime)/60000): "0"}:
            {endTime && endTime > currentTime? (Math.floor((endTime - currentTime)/1000)%60 < 10? `0${Math.floor((endTime - currentTime)/1000)%60}`: Math.floor((endTime - currentTime)/1000)%60): "00"}
        </h2>
    </div>
    )
}