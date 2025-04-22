import { useEffect, useState } from "react"
// import useSound from 'use-sound'

function Timer() {
    const [currentTime, setTime] = useState();
    const [endTime, setEnd] = useState();

    useEffect(() => {
            setInterval(()=> {
                setTime(Date.now())
            }, 1000);
    },[currentTime])


    return(
        <h2 className="title timer" style={{margin: "0"}} onClick={()=>{setEnd(Date.now() + 5 * 60000)}}>{
            endTime && endTime > currentTime? Math.floor((endTime - currentTime)/60000): "0"}:
            {endTime && endTime > currentTime? (Math.floor((endTime - currentTime)/1000)%60 < 10? `0${Math.floor((endTime - currentTime)/1000)%60}`: Math.floor((endTime - currentTime)/1000)%60): "00"
            }</h2>
    )
}

export { Timer }