import { MyElements, MyGraphics } from "./objects.js";

MyElements.input = (function(elements, graphics) {

    const MARGIN = 100;
    var container;
    var count = 0;

    graphics.resize();

    var canvas = document.getElementById("canvas-main");
    var context = canvas.getContext('2d');

    const observer = new ResizeObserver(entries => {
        graphics.resize()
        adjustZoom();
    });

    observer.observe(canvas);

    initialize();

    // Get the GUI Setup
    function initialize() {
        console.log("Initializing Inputs...")
        container = document.getElementById("input-section");
        // Clears and Resets the Container
        container.replaceChildren();

        buildLabelSection();
        container.appendChild(buildCanvasControls());


        let createSection = document.createElement("div");
        createSection.classList.add("create-section");
        
        // Build the New Element Buttons
        createSection.appendChild(createButton("box"));
        createSection.appendChild(createButton("circle"));
        createSection.appendChild(createButton("image"));
        createSection.appendChild(createButton("text"));
        createSection.appendChild(createButton("textBox"));
        
        container.appendChild(createSection);

    }

    function buildLabelSection() {

        let col_button = document.createElement("button");
        col_button.classList.add("collapsible");
        col_button.id = "collapse_button_" + count;
        col_button.innerHTML = "Alert Information";
        count += 1;
        container.appendChild(col_button);
        let section = document.createElement("div");
        section.classList.add("content");

        // GUI Transition
        col_button.addEventListener("click", () => {
            if (section.style.maxHeight) {
                section.style.maxHeight = null
                section.style.minHeight = null
            } else {
                section.style.maxHeight = section.scrollHeight + "px";
                section.style.minHeight = section.scrollHeight + "px";
            }
        })
        container.appendChild(section);

        // Save Button
        let form = document.createElement("form");
        form.id = "labelForm";
        
        let input = document.createElement("input");
        input.type = "text";
        input.id = "labelName";
        input.name = "labelName";
        
        let div = document.createElement("div");
        let label = document.createElement("label")
        label.innerHTML = "Alert Name: ";
        label.htmlFor = input.id;
        
        div.appendChild(label);
        div.appendChild(input);
        
        
        form.appendChild(div);

        section.appendChild(form)
        

        // Width Section
        let span = document.createElement("span");
        
        div = document.createElement("div");
        input = document.createElement("input");
        input.id = "labelWidth";
        input.name = "labelWidth";
        input.type = "number";
        input.step = "1";
        input.min = "200";
        input.max = "2560"; //OBS Max Screen
        input.value = "600";

        // Change label size and canvas tranformation inputs
        input.oninput = (event) => {
            if (Number(event.target.value) > Number(event.target.max)) {
                event.target.value = event.target.max
            }
            if (Number(event.target.value) < Number(event.target.min)) {
                event.target.value = event.target.min
            }
            let label = graphics.getLabel;
            label.w = Number(event.target.value);
            adjustZoom();
        }
        label = document.createElement("label");
        label.innerHTML = "Width: "
        label.htmlFor = input.id;
        
        div.appendChild(label);
        div.appendChild(input);
        span.appendChild(div);
        
        // Height Section
        div = document.createElement("div");
        input = document.createElement("input");
        input.id = "labelHeight";
        input.name = "labelHeight";
        input.type = "number";
        input.step = "1";
        input.min = "200";
        input.max = "1600"; //OBS Max Screen
        input.value = "600";
        input.oninput = (event) => {
            if (Number(event.target.value) > Number(event.target.max)) {
                event.target.value = event.target.max
            }
            if (Number(event.target.value) < Number(event.target.min)) {
                event.target.value = event.target.min
            }
            let label = graphics.getLabel;
            label.h = Number(event.target.value);
            adjustZoom();
        }
        label = document.createElement("label");
        label.innerHTML = "Height: "
        label.htmlFor = input.id;
        
        div.appendChild(label);
        div.appendChild(input);
        span.appendChild(div);
        form.appendChild(span);
        
        // Submit Button        
        let button = document.createElement("button");
        button.name = "save";
        button.value = "save";
        button.innerHTML = "Save Label";
        button.addEventListener("click", saveLabel);
        form.appendChild(button);
        
        button = document.createElement("button");
        button.name = "print";
        button.value = "print";
        button.innerHTML = "Print Label";
        button.onclick = (event) => {
            event.preventDefault();
            let readyList = [];
            let list = JSON.parse(elements.saveElements());
            for (let index in list) {
                if (list[index].type === "image" || list[index].type === "qR_Code" || list[index].type === "barcode") {
                    readyList[index] = false;
                    list[index].imageElement = document.createElement("img");
                    list[index].imageElement.onload = () => {
                        readyList[index] = true;
                    }
                    let target = "imageNotFound.png"
                    if (list[index].type === "image" && list[index].image != "") {
                        target = list[index].image;
                    }
                    if (list[index].type === "qR_Code") {
                        target = "https://api.qrserver.com/v1/create-qr-code/?data=" + encodeURIComponent(list[index].content) + "&size=" + list[index].w + "x" + list[index].w
                    }
                    if (list[index].type === "barcode") {
                        target = "https://barcodeapi.org/api/code-128/" + encodeURIComponent(list[index].content)
                    }

                    fetch(target)
                    .then((res) => {
                        console.log(res);
                        if (res.ok) {
                            return res.blob();
                        }
                    }).then((blob) => {
                        // console.log(blob);
                        list[index].imageElement.src = URL.createObjectURL(blob);
                    }).catch((error) => {
                        // console.log(error);
                        list[index].imageElement.src = "imageNotFound.png";
                    })
                }
            }
            if (!checkReady(readyList)) {
                let interval = setInterval(() => {
                    console.log("Waiting...")
                    if (checkReady(readyList)) {
                        console.log("Print: Wait")
                        clearInterval(interval);
                        let data = graphics.printLabel(list);
                        window.location.href = data;
                    }
                }, 2000)
            } else {
                console.log("Print: No Wait")
                let data = graphics.printLabel(list);
                window.location.href = data;
            }

        }
        form.appendChild(button);

        return section;
    }

    function adjustZoom() {
        let label = graphics.getLabel;
        let zoom = document.getElementById("zoom");
        let zoomMin = document.getElementById("zoomMin")
        let widthMin = (canvas.width - MARGIN * 2) / label.w; 
        let heightMin = (canvas.height - MARGIN * 2) / label.h; 
        zoom.min = Math.min(widthMin, heightMin);
        zoomMin.innerHTML = "Zoom:   " + Math.round(zoom.min * 1000)/10 + "% ";

        let rl = document.getElementById("shiftLR");
        let ud = document.getElementById("shiftUD");

        rl.min = Math.round(-100/zoom.min);
        ud.min = Math.round(-100/zoom.min);

        let translate = graphics.getTranslate
        translate.x = -rl.value;
        translate.y = -ud.value;
        graphics.setZoom(zoom.value);
    }

    function checkReady(list) {
        console.log(list);
        for (let item of list) {
            if (item === false) {
                return false;
            }
        }
        return true;
    }

    // Function to submit the form
    function submitLabel(data) {
        console.log(data);
    }
    
    // Function to submit the elements
    function saveLabel(event) {
        event.preventDefault(); //prevent page refresh
        let form = document.getElementById("labelForm");
        let formData = new FormData(form)
        
        formData.append("elements", elements.saveElements());
        formData.append("save", "save");
        
        for (var [key, value] of formData) {
            //Inputs need to have a name to be included
            console.log("Key: " + key + " Value: " + value);
        }
        submitLabel(formData);
    }

    function buildCanvasControls() {
        
        let col_button = document.createElement("button");
        col_button.classList.add("collapsible");
        col_button.id = "collapse_button_" + count;
        col_button.innerHTML = "Canvas Controls";
        count += 1;
        container.appendChild(col_button);
        let div = document.createElement("div");
        div.classList.add("content");
        
        // GUI Transition
        col_button.addEventListener("click", () => {
            if (div.style.maxHeight) {
                div.style.maxHeight = null
                div.style.minHeight = null
            } else {
                div.style.maxHeight = div.scrollHeight + "px";
                div.style.minHeight = div.scrollHeight + "px";
            }
        })
        
        container.appendChild(div);
        
        //Shift Bar
        let p = document.createElement("p");
        p.innerHTML = "Shift Canvas";
        p.style.marginBottom = 0;
        div.appendChild(p);
        
        //Shift Up/Down Range
        let shift = document.createElement("div");
        shift.classList.add("indent");
        let input = document.createElement("input");
        input.id = "shiftUD";
        input.type = "range";
        input.min = "-100";
        input.max = "-100";
        input.step = "1";
        input.value = -100;
        input.oninput = (event) => {
            let t = graphics.getTranslate;
            t.y = -event.target.value
        }
        let label = document.createElement("label");
        label.innerHTML = "Up ";
        label.htmlFor = input.id;
        shift.appendChild(label);
        shift.appendChild(input);
        label = document.createElement("label");
        label.innerHTML = " Down";
        label.htmlFor = input.id;
        shift.appendChild(label);
        
        div.appendChild(shift);

        //Shift Left/Right Range
        shift = document.createElement("div");
        shift.classList.add("indent");
        input = document.createElement("input");
        input.id = "shiftLR";
        input.type = "range";
        input.min = "-100";
        input.max = "-100";
        input.step = "1";
        input.value = -100;
        input.oninput = (event) => {
            let t = graphics.getTranslate;
            t.x = -event.target.value
        }
        label = document.createElement("label");
        label.innerHTML = "Left ";
        label.htmlFor = input.id;
        shift.appendChild(label);
        shift.appendChild(input);
        label = document.createElement("label");
        label.innerHTML = " Right";
        label.htmlFor = input.id;
        shift.appendChild(label);
                
        div.appendChild(shift);

        // Zoom bar
        let zoomDiv = document.createElement("div");
        input = document.createElement("input");
        input.id = "zoom";
        input.type = "range";
        // FIX ME
        input.min = "1";
        input.max = "8";
        input.value = "1";
        input.step = "0.001"
        input.oninput = (event) => {
            graphics.setZoom(event.target.value);
            let rl = document.getElementById("shiftLR");
            let ud = document.getElementById("shiftUD");
            let label = graphics.getLabel;
            rl.min = Math.round(-100/event.target.value);
            rl.max = Math.round((label.w * event.target.value + 100 - canvas.width)/event.target.value);
            ud.min = Math.round(-100/event.target.value);
            ud.max = Math.round((label.h * event.target.value + 100 - canvas.height)/event.target.value);
            
            let translate = graphics.getTranslate;
            translate.x = -rl.value;
            translate.y = -ud.value;
        }
        
        label = document.createElement("label");
        label.htmlFor = input.id;
        label.id = "zoomMin"
        label.innerHTML = "Zoom:   100%";
        zoomDiv.appendChild(label);
        zoomDiv.appendChild(input);
        label = document.createElement("label");
        label.id = "zoomMax"
        label.htmlFor = input.id;
        label.innerHTML = "800%";
        zoomDiv.appendChild(label);
        div.appendChild(zoomDiv);

        let gridDiv = document.createElement("div");

        input = document.createElement("input");
        input.id = "grid0";
        input.type = "radio";
        input.name = "gridRadio";
        input.value = "0"
        input.checked = "checked";
        input.onchange = (event) => {
            graphics.setGrid(1)
        }
        label = document.createElement("label")
        label.htmlFor = input.id;
        label.innerHTML = "No Grid    ";
        gridDiv.appendChild(input);
        gridDiv.appendChild(label);
        
        
        input = document.createElement("input");
        input.id = "grid10";
        input.type = "radio";
        input.name = "gridRadio";
        input.value = "10"
        input.onchange = (event) => {
            graphics.setGrid(10)
        }
        label = document.createElement("label")
        label.htmlFor = input.id;
        label.innerHTML = "10X10    ";
        gridDiv.appendChild(input);
        gridDiv.appendChild(label);
        
        input = document.createElement("input");
        input.id = "grid20";
        input.type = "radio";
        input.name = "gridRadio";
        input.value = "20"
        input.onchange = (event) => {
            graphics.setGrid(20)
        }
        label = document.createElement("label")
        label.htmlFor = input.id;
        label.innerHTML = "20X20    ";
        gridDiv.appendChild(input);
        gridDiv.appendChild(label);


        div.appendChild(gridDiv);

        return div
    }

    // Builds the Buttons to create new Elements
    function createButton(name) {
        var button = document.createElement("input");
        button.type = "button";
        button.id = "add_" + name;
        button.value="Create New " + name.charAt(0).toUpperCase() + name.slice(1).replace("_", " ");
        button.name="add" + name;

        button.onclick = (event) => {
            console.log("Build a " + name.charAt(0).toUpperCase() + name.slice(1).replace("_", " "));

            let element = {
                name: "New " + name.charAt(0).toUpperCase() + name.slice(1).replace("_", " "),
                type: name,
                x: 0,
                y: 0,
                w: 100,
                h: 100,
                rotation: 0,
            }
    
            // Create a new Element to Build inputs for
            if (name === "box") {
                element.color = "black"
                element.radii = 0;
            } else if (name === "circle") {
                element.color = "black"
            } else if (name === "text") {
                element.content = "New " + name.charAt(0).toUpperCase() + name.slice(1).replace("_", " ");
                element.color = "black";
                element.font = "Arial";
                element.size = 20;
                var context = canvas.getContext('2d');
                context.font = element.size + "px " + element.font;
                element.h = context.measureText("m").width;
                element.w = context.measureText(element.content).width;
            } else if (name === "image") {
                element.alpha = 100;
                element.image = "";
                element.imageElement = document.createElement("img");
                element.imageElement.src = element.image
            } else if (name === "textBox") {
                element.content = "New " + name.charAt(0).toUpperCase() + name.slice(1).replace("_", " ");
                element.color = "black";
                element.font = "Arial";
                element.size = 20;
                element.spacing = 0;
            } else if (name === "qR_Code") {
                element.content = "New " + name.charAt(0).toUpperCase() + name.slice(1).replace("_", " ");
                element.generate = true;
                element.imageElement = document.createElement("img");
                element.imageElement.src = "";
            } else if (name === "barcode") {
                element.barcodeType = "upc-a"
                element.content = "New " + name.charAt(0).toUpperCase() + name.slice(1).replace("_", " ");
                element.generate = true;
                element.imageElement = document.createElement("img");
                element.imageElement.src = "";
            }
            buildElement(element)
        }
        return button;
    }


    // Builds a Single Input for Element
    function buildInput(element, key, type, parent, parent_button) {
        let span = document.createElement("span");
        parent.appendChild(span);
        let input = document.createElement("input");
        if (key === "content") {
            input = document.createElement("textarea");
            input.rows = "4";
            input.cols = "50";
        // } else if (key === "barcodeType") {
        //     input = document.createElement("select");
            
        } else if (key === "font") {
            input = document.createElement("select");
        }
        input.id = "element_" + key + "_" + count;
        
        
        if (key !== "generate") {
            let label = document.createElement("label");
            label.htmlFor = input.id
            label.innerHTML = key.toUpperCase() + ":   ";
            span.appendChild(label);
        }
        if (key === "alpha") {
            let label = document.createElement("label");
            label.htmlFor = input.id
            label.innerHTML = "0";
            span.appendChild(label);
        }
        span.appendChild(input);
        if (key === "alpha") {
            let label = document.createElement("label");
            label.htmlFor = input.id
            label.innerHTML = "100";
            span.appendChild(label);
        }

        if (key === "name") {
            input.type = "text"

            input.oninput = (event) => {
                element[key] = event.target.value;
                parent_button.innerHTML = event.target.value;
            };
        } else if (key === "color") {
            input.type = "text";
            input.oninput = (event) => {
                element[key] = event.target.value;

            };
        } else if (key === "content") {
            if (element.type === "text") {
                input.oninput = (event) => {
                    element[key] = event.target.value;
                    context.font = element.size + "px " + element.font;
                    element["w"] = Number(context.measureText(event.target.value).width);
                    elements.updateInputs(element);
                }
            } else {
                input.oninput = (event) => {
                    element[key] = event.target.value;
                }
            }
        } else if ((key === "w" || key === "h") && type === "text") {
            input.type = "number";
            input.disabled = true;
        } else if (key === "size") {
            input.type = "number";
            if (element.type === "text") {
                input.oninput = (event) => {
                    element[key] = Number(event.target.value);
                    context.font = element.size + "px " + element.font;
                    element["h"]= Number(context.measureText(event.target.value).fontBoundingBoxDescent + context.measureText(event.target.value).fontBoundingBoxAscent);
                    element["w"] = Number(context.measureText(element.content).width);
                    elements.updateInputs(element);
                }
            } else {
                input.oninput = (event) => {
                    element[key] = Number(event.target.value);
                }
            }
        } else if (key === "font") {
            let options = ["Arial", "Verdana", "Tahoma", "Trebuchet MS", "Times New Roman", "Georgia", "Garamond", "Courier New", "Brush Script MT"];
                
            for (item of options) {
                let option = document.createElement("option");
                option.value = item;
                option.innerHTML = item;
                input.appendChild(option);
            }
            
            if (element.type === "text") {
                input.onchange = (event) => {
                    element[key] = event.target.value;
                    context.font = element.size + "px " + element[key];
                    element["h"]= Number(context.measureText(event.target.value).fontBoundingBoxDescent + context.measureText(event.target.value).fontBoundingBoxAscent);
                    element["w"]= Number(context.measureText(element.content).width);
                    elements.updateInputs(element);
                }   
            } else {
                input.onchange = (event) => {
                    element[key] = event.target.value;
                }
            }
        } else if (key === "image") {
            input.type = "text";
            input.oninput = (event) => {
                element[key] = event.target.value;
                fetch(event.target.value)
                    .then((res) => {
                        console.log(res);
                        if (res.ok) {
                            return res.blob();
                        }
                    }).then((blob) => {
                        // console.log(blob);
                        element.imageElement.src = URL.createObjectURL(blob);
                    }).catch((error) => {
                        // console.log(error);
                        element.imageElement.src = "imageNotFound.png";
                    })
            }
        } else if (key === "alpha") {
            
            input.type = "range";
            input.min = 0;
            input.max = 100;
            input.oninput = (event) => {
                element[key] = Number(event.target.value)/100;
            }
        } else if (key === "generate") {
            input.type = "button";
            input.value = "Generate " + element.type.charAt(0).toUpperCase() + element.type.slice(1).replace("_", " ");
            input.onclick = (event) => {
                if (element.type === "qR_Code") {
                    fetch("https://api.qrserver.com/v1/create-qr-code/?data=" + encodeURIComponent(element.content) + "&size=" + element.w + "x" + element.w)
                        .then((res) => {
                            if (res.ok) {
                                return res.blob();
                            }
                        }).then((blob) => {
                            element.imageElement.src = URL.createObjectURL(blob);
                        }).catch((error) => {
                            // console.log(error);
                            element.imageElement.src = "imageNotFound.png";
                        })
                } else {
                    fetch ("https://barcodeapi.org/api/code-128/" + encodeURIComponent(element.content))
                        .then((res) => {
                            if (res.ok) {
                                return res.blob();
                            }
                        }).then((blob) => {
                            element.imageElement.src = URL.createObjectURL(blob); 
                        }).catch((error) => {
                            // console.log(error);
                            element.imageElement.src = "imageNotFound.png";
                        })
                }
            }
        // } else if (key === "barcodeType") {
        //     input.type = "select";
        //     input.value = element.barcodeType;
        } else {
            input.type = "number"
            input.oninput = (event) => {
                element[key] = Number(event.target.value);
            };
        }
        return input;
    }

    function attachButtons(count, element, parent_button, parent_div) {
        let span = document.createElement("span");
        let up = document.createElement("input");
        up.type = "button";
        up.value = "Move Forward";
        up.id = "shift_up_" + count;
        up.onclick = (event) => {
            elements.shiftForward(element);
        }

        let down = document.createElement("input");
        down.type = "button";
        down.value = "Move Back";
        down.id = "shift_down_" + count;
        down.onclick = (event) => {
            elements.shiftBack(element);
        }

        let delete_element = document.createElement("input");
        delete_element.type = "button";
        delete_element.value = "Delete";
        delete_element.id = "delete_element_" + count;
        delete_element.onclick = (event) => {
            elements.deleteElement(element);
            parent_button.remove();
            parent_div.remove();
        }

        span.appendChild(up);
        span.appendChild(down);
        span.appendChild(delete_element);

        return span;
    }

    // Builds the element and GUI for Element
    function buildElement(element) {
        let inputs = {}
        let col_button = document.createElement("button");
        col_button.classList.add("collapsible");
        col_button.id = "collapse_button_" + count;
        col_button.innerHTML = element.name;
        let div = document.createElement("div");
        div.classList.add("content");

        // Build an Input for Each Non-Type Key
        for (let key in element) {
            if (key !==  "type" && key !== "imageElement") {
                inputs[key] = buildInput(element, key, element.type, div, col_button);
            }
        }

        if (element.type === "image") {
            element.imageElement = document.createElement("img");
            element.imageElement.src = element.image;
        }

        if (element.type === "barcode" || element.type === "qR_Code") {
            element.imageElement = document.createElement("img");
        }
        

        div.appendChild(attachButtons(count, element, col_button, div));

        container.appendChild(col_button);
        container.appendChild(div);
        

        // GUI Transition
        col_button.addEventListener("click", () => {
            if (div.style.maxHeight) {
                div.style.maxHeight = null
                div.style.minHeight = null
            } else {
                div.style.maxHeight = div.scrollHeight + "px";
                div.style.minHeight = div.scrollHeight + "px";
            }
        })
        
        element["inputs"] = inputs;
        elements.appendElement(element)
        // console.log(element);

        count += 1;
    }


    let api = {
        initialize: initialize
    }

    return api;
}(MyElements.main, MyGraphics.graphics));