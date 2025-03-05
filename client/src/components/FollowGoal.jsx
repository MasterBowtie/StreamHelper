import { useEffect, useState } from 'react';
import { useApi } from "../utils/use_api";
import { io } from "socket.io-client";


// TODO: Get Twitch suggested goal milestones
export default function FollowGoal() {
    const [followers, setFollowers] = useState(0);
    const [recent, setRecent] = useState("");
    const [socket, setSocket] = useState(undefined);
    const [percentage, setPercent] = useState("0%")
    const [goal, setGoal] = useState(50);
    const api = useApi();

    useEffect(()=> {
      let s = io();
      api.get("/twitch/followers").then(res => {
        setSocket(s)
        setFollowers(res.data.total)
        setRecent(res.data.data[0])
      })
      return s.disconnect()
    }, [])

    useEffect(() => {
      if (!socket) {
        return;
      }
      socket.on("follow", () => {
        api.get("/followers").then(res => {
          setSocket(s)
          setFollowers(res.data.total)
          setRecent(res.data.data[0])
        })
      })
    } ,[socket])

    useEffect(() => {
      let per = Math.floor(followers/goal * 100);
      setPercent(`${per}%`)
    }, [followers])    

    return (
        <>
        <div>
          <h1 style={{margin: "0", textAlign: "right", color: 'white'}}>Most Recent Follower: {recent.user_name}</h1>
        </div>
          <div style={{width: "500px", borderColor: 'black', borderWidth: "3px", borderStyle: "solid"}}>
              <h1 style={{width: percentage, backgroundColor: 'green', margin: "0", color: "white", textAlign: "center"}}>{followers}/{goal} Followers</h1>
          </div>
        </>
    )
}