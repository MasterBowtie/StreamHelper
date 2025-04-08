import { useEffect } from "react"

function Canvas() {

    useEffect(() => {
        // Add script element here

        // <script>var MyCanvas = {}</script>
        // <script src="../scripts/game_loader.js"></script>
    }, [])

    return (
    <div>
        <canvas id="canvas-main" height="400" width="1920" style={{backgroundColor: "red"}}></canvas>
    </div>
    )
}

export {Canvas}