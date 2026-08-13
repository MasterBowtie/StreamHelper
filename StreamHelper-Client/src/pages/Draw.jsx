import { useEffect, useRef, useState } from "react"
import { MyElements, MyGraphics } from "../../scripts/objects.js"
import DrawTools from "../components/DrawTools.jsx";
import "../css/draw.css";


export default function Draw() {
    const canvasRef = useRef(null);
    const [initialized, setInitialized] = useState(false);


    useEffect(()=> {
        async function initialize() {
            await import("../../scripts/matrix.js")
            await import("../../scripts/graphics.js")
            await import("../../scripts/keyboard.js")
            await import("../../scripts/mouse_input.js")
            await import("../../scripts/edit.js")
            await import("../../scripts/builder.js")
            await import("../../scripts/driver.js")

            setInitialized(true);
        }

        initialize();
    }, []);
    return (
        <div className="page draw">
            <canvas id="canvas-main"></canvas>
            <div id="input-section"></div>
        </div>
    )
}