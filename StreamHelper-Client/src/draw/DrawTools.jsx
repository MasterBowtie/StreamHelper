import { useEffect, useState } from "react";

export default function DrawTools({elements, graphics, canvas}) {
    const [translate, setTranslate] = useState({x: -100, y: -100})
    const [zoom, setZoom] = useState(1);
    const [label, setLabel] = useState({w: 600, h: 600});
    function createElement(type) {
        const element = { 
            name: `New ${type}`,
            type: type,
            x: 0,
            y: 0,
            w: 100,
            h: 100,
            rotation: 0,
            alpha: 100,
            properties: {}};

        switch (type) {
            case "box": 
                element.properties.color = "rgba(0,0,0,1)";
                element.properties.radii = 0;
                break;

            case "circle":
                element.properties.color = "rgba(0,0,0,1)"
                break;

            case "image":
                element.properties.filepath = "";
                break;
                
            case "textbox":
                element.properties.spacing = 0;

            case "text":
                element.properties.content = "New Text";
                element.properties.color = "black";
                element.properties.font = "Arial";
                element.properties.text_size = 20;
                break;
        }

        elements.push(element);
    }

    useEffect(()=> {
        graphics.graphics.setOnTranslateChange(setTranslate);
        graphics.graphics.setOnZoomChange(setZoom);
        graphics.graphics.setOnLabelChange(setLabel);
    }, [])

    useEffect(() => {
        graphics.graphics.setZoom(zoom);
    }, [zoom]);

    useEffect(() => {
        graphics.graphics.setTranslate(translate);
    }, [translate]);

    useEffect(()=> {
        graphics.graphics.setLabel(label);
    },[label])



    return (
        <div id="input-section">
                <button>Alert Information</button>
                <div className="content">
                    <form id="alertForm">
                        <div>
                            <label htmlFor="alertName">Alert Name:</label>
                            <input id="alertName" name="alertName"/>
                        </div>
                        <span>
                            <div>
                                <label htmlFor="alertWidth">Alert Width:</label>
                                <input id="alertWidth" name="alertWidth" type="number" step="1" min="100" max="2560" value={label.w} onChange={(e)=> {setLabel({...label, w: Number(e.target.value)})}}/>
                            </div>
                            <div>
                                <label htmlFor="alertHeight">Alert Height:</label>
                                <input id="alertHeight" name="alertHeight" type="number" step="1" min="100" max="1600" value={label.h} onChange={(e)=> {setLabel({...label, h: Number(e.target.value)})}}/>
                            </div>
                        </span>
                        <button name="save" value="save">Save Alert</button>
                        <button name="delete" value="delete">Delete Alert</button>
                    </form>
                </div>

                <button>Canvas Controls</button>
                <div className="content">
                    <p>Shift Canvas</p>
                    <div className="indent">
                        <label htmlFor="shiftUD">UP</label>
                        {/* FIXME Dynamic sizing */}
                        <input id="shiftUD" type="range" min="-100" max={canvas.h - label.h - 100} step="1" onChange={(e)=> {console.log(e.target.value); setTranslate({...translate, y: Number(-e.target.value)})}}/>
                        <label htmlFor="shiftUD">Down</label>
                    </div>

                    <div className="indent">
                        <label htmlFor="shiftLR">Left</label>
                        {/* FIXME Dynamic sizing */}
                        <input id="shiftLR" type="range" min="-100" max={canvas.w - label.w - 100} step="1" onChange={(e)=> {setTranslate({...translate, x: Number(-e.target.value)})}}/>
                        <label htmlFor="shiftLR">Right</label>
                    </div>

                    <div>
                        <label htmlFor="Zoom">100%</label>
                        <input value={zoom} id="Zoom" type="range" min="1" max="8" step="0.001" onChange={(e)=> {setZoom(Number(e.target.value))}}/>
                        <label htmlFor="Zoom">800%</label>
                    </div>

                    <div>
                        <input id="grid0" type="radio" name="gridRadio" value/>
                        <label htmlFor="grid0">No Grid</label>

                        <input id="grid10" type="radio" name="gridRadio" value/>
                        <label htmlFor="grid10">10x10</label>

                        <input id="grid20" type="radio" name="gridRadio" value/>
                        <label htmlFor="grid20">20x20</label>
                    </div>
                </div>

                <div>
                    <input id="add_box" type="button" value="Create New Box" name="addbox"/>
                    <input id="add_circle" type="button" value="Create New Circle" name="addcircle"/>
                    <input id="add_image" type="button" value="Create New Image" name="addimage"/>
                    <input id="add_text" type="button" value="Create New Text" name="addtext"/>
                    <input id="add_textbox" type="button" value="Create New Textbox" name="addtextbox"/>
                </div>
            </div>
    )
}