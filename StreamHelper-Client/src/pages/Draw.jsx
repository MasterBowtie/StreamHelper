import { useEffect, useRef, useState } from "react"
import { MyDraw } from "../../scripts/objects.js"
import DrawTools from "../components/DrawTools.jsx";
import "../css/draw.css";
import DrawMenu from "../components/DrawMenu.jsx";


export default function Draw() {
    const canvasRef = useRef(null);
    const [sidebarOpen, setSideBarOpen] = useState(false);
    const [initialized, setInitialized] = useState(false);


    useEffect(()=> {
        async function initialize() {
            console.log("Initialize");
            await import("../../scripts/graphics.js")
            await import("../../scripts/keyboard.js")
            await import("../../scripts/mouse.js")
            await import("../../scripts/state.js")
            await import("../../scripts/logic.js")
            await import("../../scripts/inputs.js")

            let canvas = document.getElementById("canvas-main");
            MyDraw.graphics.initialize(canvas);
            MyDraw.keyboard.initialize();
            MyDraw.mouse.initialize(canvas);
            MyDraw.state.initialize(MyDraw.inputs);
            MyDraw.logic.initialize();
            MyDraw.inputs.initialize();

            setInitialized(true);
        }

        initialize();

        return () => {
            MyDraw.graphics.destroy();
            setInitialized(false);
        }
    }, []);
    return (
        <div className="page draw">
            <canvas id="canvas-main"></canvas>
            <button className="sidebar-toggle" onClick={()=> setSideBarOpen(!sidebarOpen)}>Toggle</button>
            <aside className={`sidebar ${sidebarOpen ? "open": ""}`}>
                {
                    initialized?(<DrawMenu MyDraw={MyDraw}/>):<p>Loading...</p>
                }
            </aside>
        </div>
    )
}