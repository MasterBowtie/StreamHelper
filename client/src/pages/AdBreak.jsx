import { useState } from "react";
import { useEffect } from "react";
import { io } from "socket.io-client";

export default function AdBreak() {
    const [socket, setSocket] = useState();
    const [currentTime, setTime] = useState();
    const [endTime, setEnd] = useState();
    const [alert, setAlert] = useState();

    useEffect(()=> {
        let tempAudio = new Audio("src/assets/AdStart.mp3");
        tempAudio.loop = false;
        setAlert(tempAudio);
        let s = io();
        setSocket(s);
        s.emit("create", "webhook");
        return () => { s.disconnect() }
    },[])

    useEffect(() => {
        if (!socket) return;
        socket.on("channel.ad_break.begin", (data)=> {
            console.log("Duration: ", parseInt(data));
            setEnd(parseInt(data));
            // alert.play();
        })
    },[socket])

    useEffect(() => {
        setInterval(()=> {
            setTime(Date.now())
        }, 1000);
    },[currentTime])

    return (
    <>
        <h2 className="title timer" style={{top: "20%"}} onClick={alert? alert.play(): null}>
            {endTime && endTime > currentTime? Math.floor((endTime - currentTime)/60000): "0"}:
            {endTime && endTime > currentTime? (Math.floor((endTime - currentTime)/1000)%60 < 10? `0${Math.floor((endTime - currentTime)/1000)%60}`: Math.floor((endTime - currentTime)/1000)%60): "00"}
        </h2>
    </>
    )
}