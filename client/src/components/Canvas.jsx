import { useEffect } from "react"

function Canvas() {

    const MyCanvas = {};

    useEffect(() => {
        // Add script element here

        let script = document.createElement('script');
        script.innerHTML = "MyCanvas = {}";
        document.body.appendChild(script);
        
        script = document.createElement('script');
        script.src = "scripts/avatars/loader.js";
        document.body.appendChild(script);


        // <script>var MyCanvas = {}</script>
        // <script src="../scripts/game_loader.js"></script>
    }, [])

    return (
    <div>
        <canvas id="canvas-main" height="400" width="1920" style={{backgroundColor: "white"}}></canvas>
    </div>
    )
}

export {Canvas}