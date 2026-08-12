export default function DrawTools(elements) {

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
                                <input id="alertWidth" name="alertWidth" type="number" step="1" min="100" max="5000"/>
                            </div>
                            <div>
                                <label htmlFor="alertHeight">Alert Height:</label>
                                <input id="alertHeight" name="alertHeight" type="number" step="1" min="100" max="5000"/>
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
                        <input id="shiftUD" type="range" min="-20" max="5020" step="1"/>
                        <label htmlFor="shiftUD">Down</label>
                    </div>

                    <div className="indent">
                        <label htmlFor="shiftLR">UP</label>
                        <input id="shiftLR" type="range" min="-20" max="5020" step="1"/>
                        <label htmlFor="shiftLR">Down</label>
                    </div>

                    <div>
                        <label htmlFor="Zoom">100%</label>
                        <input id="Zoom" type="range" min="1" max="8" step="0.001"/>
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