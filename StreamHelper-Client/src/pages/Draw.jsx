<<<<<<< Updated upstream
import { useEffect, useRef } from "react"
// import { MyElements, MyGraphics } from "../../scripts/objects.js"
import DrawTools from "../components/DrawTools.jsx";
=======
import { useEffect, useRef, useState } from "react"
import { MyDraw } from "../../scripts/objects.js"
import DrawTools from "../components/draw/DrawTools.jsx";
import "../css/draw.css";
import DrawMenu from "../components/draw/DrawMenu.jsx";
>>>>>>> Stashed changes


export default function Draw() {
    const canvasRef = useRef(null);

    useEffect(()=> {
        async function initialize() {
            // await import("../../scripts/matrix.js")
            // await import("../../scripts/graphics.js")
            // await import("../../scripts/keyboard.js")
            // await import("../../scripts/mouse_input.js")
            // await import("../../scripts/edit.js")
            // await import("../../scripts/builder.js")
            // await import("../../scripts/driver.js")
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