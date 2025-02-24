import { useEffect, useState } from 'react';
import { useApi } from "../utils/use_api";

export default function FollowGoal() {
    const [followers, setFollowers] = useState();
    const [socket, setSocket] = useState();
    const api = useApi();

    useEffect(()=> {
      api.get("/followers").then(res => {
        setFollowers(res.total)
      })
    }, [])

    return (
        <>
          <h1>{followers}/50</h1>
        </>
    )
}