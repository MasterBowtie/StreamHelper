import { useEffect, useRef } from "react"
import { MyElements, MyGraphics } from "../../scripts/objects.js"
import DrawTools from "../components/DrawTools.jsx";


export default function Draw() {
    const canvasRef = useRef(null);

    useEffect(()=> {
        async function initialize() {
            await import("../../scripts/matrix.js")
            await import("../../scripts/graphics.js")
            await import("../../scripts/keyboard.js")
            await import("../../scripts/mouse_input.js")
            await import("../../scripts/edit.js")
            await import("../../scripts/builder.js")
            await import("../../scripts/driver.js")
        }

        initialize();
    }, []);
    return (
        <>
            <canvas ref={canvasRef} id="canvas-main" width={800} height={800}></canvas>
            {/* <DrawTools/> */}
        </>
    )
}