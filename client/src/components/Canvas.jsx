import { useEffect, useState } from "react"
import { io } from "socket.io-client";

function Canvas() {
    const [socket, setSocket] = useState();
    // const MyCanvas = {};

    useEffect(() => {
        // Add script element here

        let script = document.createElement('script');
        script.innerHTML = "MyCanvas = {}";
        document.body.appendChild(script);
        
        script = document.createElement('script');
        script.src = "scripts/avatars/loader.js";
        document.body.appendChild(script);

        let s = io();
        setSocket(s);
        return () => {
            s.disconnect();
        }
    }, [])

    // Add to db

    // !r255
    // !g255
    // !b255

    useEffect(()=> {
        if (!socket) return;

        socket.on("channel.chat.avatar", (data)=> {

            // Need to get info to Canvas Element
            script = document.getElementById("innerScript");
            // script.innerHTML(`MyCanvas.users.add(${data})`);
        })
    }, [socket])


    return (
    <div>
        <canvas id="canvas-main" height="400" width="1920" style={{backgroundColor: "white"}}></canvas>
        <script id="innerScript"></script>
    </div>
    )
}

export {Canvas}