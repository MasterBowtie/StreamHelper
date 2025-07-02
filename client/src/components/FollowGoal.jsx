import { useEffect, useState } from 'react';
import { useApi } from "../utils/use_api";
import { io } from "socket.io-client";


// TODO: Get Twitch suggested goal milestones
export default function FollowGoal() {
    const [followers, setFollowers] = useState(0);
    const [recentFollower, setRecentFollower] = useState("");
    const [recentSub, setRecentSub] = useState("");
    const [socket, setSocket] = useState(undefined);
    const [percentage, setPercent] = useState("0%")
    const [goal, setGoal] = useState(50);
    const api = useApi();

    useEffect(()=> {
      let s = io();
      s.emit("create", "webhook");
      api.get("/twitch/followers").then(res => {
        setSocket(s)
        setFollowers(res.data.total)
        setRecentFollower(res.data.data[0])
      })
      api.get("/twitch/recent_sub").then(res=> {
        console.log(res.data);
        setRecentSub(res.data);
      })
      return () => {  
        s.disconnect();
      }
    }, [])

    useEffect(() => {
      if (!socket) {
        return;
      }

      socket.on("channel.follow", (data) => {
        console.log("Follow: ", data);
        api.get("twitch/followers").then(res => {
          setFollowers(res.data.total);
          setRecentFollower(res.data.data[0]);
        })
      })

      socket.on("channel.subscribe", (data) =>{
        api.get("twitch/recent_sub").then(res=> {
          setRecentSub(res.data);
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
          <h1 style={{margin: "0", textAlign: "left", color: 'white'}}>Most Recent Subscriber:</h1>
          <h1 style={{margin: "0", textAlign: "right", color: "white"}}>{recentSub.user_name}{recentSub.gifted? ` (Gifted By:${recentSub.gifted_by_name})`: ""}</h1>
        </div>
        <div>
          <h1 style={{margin: "0", textAlign: "left", color: 'white'}}>Most RecentFollower Follower:</h1>
          <h1 style={{margin: "0", textAlign: "right", color: "white"}}>{recentFollower.user_name}</h1>
        </div>
          <div style={{width: "500px", borderColor: 'black', borderWidth: "3px", borderStyle: "solid", backgroundColor: "white"}}>
              <h1 style={{width: percentage, backgroundColor: 'green', margin: "0", color: "white", textAlign: "center"}}>{followers}/{goal} Followers</h1>
          </div>
        </>
    )
}