import { useEffect, useState } from "react"
import { io } from "socket.io-client";
import { canvasGraphics } from "../../scripts/avatars/graphics";

function Canvas() {
    const [socket, setSocket] = useState();
    const [prevTime, setPreviousTime] = useState();
    const [graphics, setGraphics] = useState();

    useEffect(() => {
        setPreviousTime(Date.now());
        setGraphics(canvasGraphics());
        
        let s = io();
        setSocket(s);

        return () => {
            s.disconnect();
        }
    }, [])

    useEffect(() => {
        requestAnimationFrame(animationLoop);
    }, [graphics]);

    // Add to db

    // !r255
    // !g255
    // !b255

    useEffect(()=> {
        if (!socket) return;

        socket.on("channel.chat.avatar", (data)=> {

        })
    }, [socket])

    function update(gameTime) {

    }

    function render(gameTime) {
        if (!graphics) {
            return;
        }
        let test = {x: 200, y: 200, r: 255, g: 0, b: 0}

        graphics.drawImage(test);
    }

    function animationLoop(time) {
        var gameTime = time - prevTime; 

        update(gameTime);
        render(gameTime);

        setPreviousTime(time);
        requestAnimationFrame(animationLoop);
    }


    return (
    <div>
        <canvas id="canvas-main" height="400" width="1920" style={{backgroundColor: "white"}}></canvas>
    </div>
    )
}

export {Canvas}