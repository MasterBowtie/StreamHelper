import { useEffect, useState } from 'react';
import { io } from "socket.io-client";

export default function FollowGoal() {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        let s = io();
        setSocket(s);
        console.log("Getting Socket")
        return () => { s.disconnect()}
      },[])

      useEffect(() => {
        if(!socket) return;
        console.log("Get Followers:")
        socket.emit("followers");
        socket.on("moderator:read:followers", (data) => {
            console.log(data);
        })
      },[socket])

    return 
        <>
        </>
}