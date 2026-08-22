import { useEffect, useRef, useState } from "react"
import { MyDraw } from "../../scripts/objects.js"
import DrawTools from "../components/DrawTools.jsx";
import "../css/draw.css";


export default function Draw() {
    const canvasRef = useRef(null);
    const [initialized, setInitialized] = useState(false);


    useEffect(()=> {
        async function initialize() {
            await import("../../scripts/graphics.js")
            await import("../../scripts/keyboard.js")
            await import("../../scripts/mouse.js")
            await import("../../scripts/state.js")
            await import("../../scripts/logic.js")
            // await import("../../scripts/driver.js")

            setInitialized(true);
        }

        initialize();
    }, []);
    return (
        <div className="page draw">
            <canvas id="canvas-main"></canvas>
            <div id="input-section">
                <button onClick={() => {
                    const id = MyDraw.state.addElement("box");
                    MyDraw.state.setCurrentElement(id);
                    }}>
                    Add Box
                </button>
            </div>
        </div>
    )
}