import { MyElements, MyGraphics } from "./objects.js";

MyElements.main = (function(graphics, mouse_input, keyboard) {

    var canvas = document.getElementById("canvas-main");
    var context = canvas.getContext('2d', { alpha: false});
    var cursors = ["se-resize", "sw-resize", "ne-resize", "nw-resize"];

    var currentElement = null;
    var elements = []
    var previousState = {
        x: 0,
        y: 0,
        leftIsDown: false
    };
    var selected = false;
    var translate = false;

    // Holds the coordinates of a point in translation.
    var diff = {
        x: 0,
        y: 0,
    }

    var anchor = {x: 0, y: 0}
    var center = {
        x: 0,
        y: 0
    }

    keyboard.registerCommand("w", "keydown", false, bumpUp);
    keyboard.registerCommand("s", "keydown", false, bumpDown);
    keyboard.registerCommand("a", "keydown", false, bumpLeft);
    keyboard.registerCommand("d", "keydown", false, bumpRight);
    keyboard.registerCommand("=", "keydown", false, zoomIn);
    keyboard.registerCommand("-", "keydown", false, zoomOut);
    keyboard.registerCommand(" ", "keydown", true, startTranslate);
    keyboard.registerCommand(" ", "keyup", true, endTranslate);


    keyboard.registerCommand("ArrowUp", "keydown", false, bumpUp);
    keyboard.registerCommand("ArrowDown", "keydown", false, bumpDown);
    keyboard.registerCommand("ArrowLeft", "keydown", false, bumpLeft);
    keyboard.registerCommand("ArrowRight", "keydown", false, bumpRight);

    function bumpUp() {
        if (currentElement) {
            currentElement.y -= graphics.getGrid;
        }
    }

    function bumpDown() {
        if (currentElement) {
            currentElement.y += graphics.getGrid;
        }
    }
    
    function bumpLeft() {
        if (currentElement) {
            currentElement.x -= graphics.getGrid;
        }
    }

    function bumpRight() {
        if (currentElement) {
            currentElement.x += graphics.getGrid;
        }
    }
    

    // Big Errors with this Ability
    function startTranslate() {
        translate = true;
    }
    
    function endTranslate() {
        translate = false;
        canvas.style.cursor = "auto";
    }
    
    // Update inputs as well
    function zoomOut() {
        let zoom = graphics.getZoom
        zoom -= .01;
        if (zoom < .33) {
            graphics.setZoom(.33);
        } else {
            graphics.setZoom(zoom);
        }
        let input = document.getElementById("zoom");
        input.value = zoom;
        input.dispatchEvent(new InputEvent("input"));
    }
    
    // Update inputs as well
    function zoomIn() {
        let zoom = graphics.getZoom
        zoom += .01;
        if (zoom > 8) {
            graphics.setZoom(8);
        } else {
            graphics.setZoom(zoom);
        }
        let input = document.getElementById("zoom");
        input.value = zoom;
        input.dispatchEvent(new InputEvent("input"));
    }

    function appendElement(element) {
        elements.push(element);
        updateInputs(element);
    }

    function deleteElement(element) {
        let index = elements.indexOf(element);
        elements.splice(index, 1);
        currentElement = null;
    }

    function shiftForward(element) {
        let index = elements.indexOf(element);
        currentElement = element;
        if (index < elements.length - 1) {
            elements[index] = elements[index + 1];
            elements[index + 1] = element;
        }
    }

    function shiftBack(element) {
        let index = elements.indexOf(element);
        currentElement = element;
        if (index > 0) {
            elements[index] = elements[index - 1];
            elements[index - 1] = element; 
        }
    }

    function updateInputs(element) {
        if (element) {
            // Limit rotation
            if (element.rotation > 180) {
                element.rotation -= 360;
            }
            if (element.rotation < -180) {
                element.rotation += 360;
            }                    

            // removes negatives from Box height and width
            if (element && (element.type === "box" || element.type === "image")) {
                if (element.w < 0) {
                    let x = element.x + element.w;
                    element.x = x;
                    element.w = -element.w;
                }
                if (element.h < 0) {
                    let y = element.y + element.h;
                    element.y = y;
                    element.h = -element.h;
                }
            }
            if (element.type === "qR_Code") {
                element.h = element.w;
            }

            keys = []
            for (key in element) {
                keys.push(key);
            }
            for (let i = 0; i < keys.length; i++) {
                if (element.inputs[keys[i]]) {
                    if (keys[i] === "generate") {
                    } else if (keys[i] === "alpha") {
                        element["inputs"][keys[i]].value = element[keys[i]] * 100;
                    } else {
                        element["inputs"][keys[i]].value = element[keys[i]];
                    }
                }
            }
        }
    }
    
    function adjustTextSize(element) {
        context.font = element.size + "px " + element.font;
        element.h = context.measureText("m").width;
        element.w = context.measureText(element.content).width;
    }
    
    //TODO: Fix Rotation Tranformation
    function nwResize(element, mouseState) {
        let adjust = graphics.transformPoint({x: element.x + element.w, y: element.y + element.h}, element, false);
        if (element.type === "text") {
            while (Math.round(element.w) < Math.round((diff.x - mouseState.x)/graphics.getGrid) * graphics.getGrid) {
                element.size += 1;
                adjustTextSize(element);
            }
            while (Math.round(element.w) > Math.round((diff.x - mouseState.x)/graphics.getGrid)* graphics.getGrid && element.size > 0) {
                element.size -= 1;
                adjustTextSize(element);
            }
            element.y = Math.round(diff.y - element.h);              
            element.x = Math.round((mouseState.x)/graphics.getGrid) * graphics.getGrid;
            let gap = Math.sqrt((anchor.x - adjust.x) * (anchor.x - adjust.x) + (anchor.y - adjust.y) * (anchor.y - adjust.y));
            let index = 0;
            while (element.rotation != 0 && gap > 1 && index < 10) {
                element.x = Math.round((element.x + (anchor.x - adjust.x))/graphics.getGrid) * graphics.getGrid;
                element.y = Math.round(element.y + (anchor.y - adjust.y)); 
                adjust = graphics.transformPoint({x: element.x + element.w, y: element.y + element.h}, element, false);
                gap = Math.sqrt((anchor.y - adjust.y) * (anchor.y - adjust.y) + (anchor.x - adjust.x) * (anchor.x - adjust.x));
                index++;
            }
            if (element.rotation != 0) {
                diff = {x:element.x + element.w, y: element.y + element.h};
            }
        } else if (element.type === "qR_Code") {
            element.w = Math.round((diff.x - mouseState.x)/graphics.getGrid) * graphics.getGrid;
            element.h = element.w
            element.y = Math.round((diff.y - element.h)/graphics.getGrid) * graphics.getGrid;

            let gap = Math.sqrt((anchor.x - adjust.x) * (anchor.x - adjust.x) + (anchor.y - adjust.y) * (anchor.y - adjust.y));
            let index = 0;
            while (gap > 1 && index < 10) {
                element.x = Math.round((mouseState.x)/graphics.getGrid) * graphics.getGrid;
                element.w = Math.round(element.w + (anchor.x - adjust.x));
                element.h = element.w;
                element.y = Math.round((diff.y + (anchor.y - adjust.y) - element.h)/graphics.getGrid)*graphics.getGrid;
                adjust = graphics.transformPoint({x: element.x + element.w, y: element.y + element.h}, element, false);
                gap = Math.sqrt((anchor.y - adjust.y) * (anchor.y - adjust.y) + (anchor.x - adjust.x) * (anchor.x - adjust.x));
                index++;
            }
            diff = {x:element.x + element.w, y: element.y + element.h};
        } else {    
            element.y = Math.round((mouseState.y)/graphics.getGrid) * graphics.getGrid;
            element.x = Math.round((mouseState.x)/graphics.getGrid) * graphics.getGrid;
            element.h = Math.round((diff.y - mouseState.y)/graphics.getGrid) * graphics.getGrid;
            element.w = Math.round((diff.x - mouseState.x)/graphics.getGrid) * graphics.getGrid;

            let gap = Math.sqrt((anchor.x - adjust.x) * (anchor.x - adjust.x) + (anchor.y - adjust.y) * (anchor.y - adjust.y));
            let index = 0;
            while (gap > 1 && index < 10) {
                element.y = Math.round((mouseState.y)/graphics.getGrid) * graphics.getGrid;
                element.x = Math.round((mouseState.x)/graphics.getGrid) * graphics.getGrid;
                element.w = Math.round(element.w + (anchor.x - adjust.x));
                element.h = Math.round(element.h + (anchor.y - adjust.y));
                adjust = graphics.transformPoint({x: element.x + element.w, y: element.y + element.h}, element, false);
                gap = Math.sqrt((anchor.y - adjust.y) * (anchor.y - adjust.y) + (anchor.x - adjust.x) * (anchor.x - adjust.x));
                index++;
            }
            diff = {x:element.x + element.w, y: element.y + element.h};
        }
    }
    
    //TODO: Fix Rotation Tranformation
    function neResize(element, mouseState) {
        let adjust = graphics.transformPoint({x: element.x, y: element.y + element.h}, element, false);
        if (element.type === "text") {
            while (Math.round(element.w) < Math.round((mouseState.x - diff.x)/graphics.getGrid) * graphics.getGrid) {
                element.size += 1;
                adjustTextSize(element);
            }
            while (Math.round(element.w) > Math.round((mouseState.x - diff.x)/graphics.getGrid) * graphics.getGrid && element.size > 0) {
                element.size -= 1;
                adjustTextSize(element);
            }
            element.y = diff.y - element.h;

            let gap = Math.sqrt((anchor.x - adjust.x) * (anchor.x - adjust.x) + (anchor.y - adjust.y) * (anchor.y - adjust.y));
            let index = 0;
            while (element.rotation != 0 && gap > 1 && index < 10) {
                element.x = Math.round((element.x + (anchor.x - adjust.x))/graphics.getGrid) * graphics.getGrid;
                element.y = Math.round(element.y + (anchor.y - adjust.y)); 
                adjust = graphics.transformPoint({x: element.x, y: element.y + element.h}, element, false);
                gap = Math.sqrt((anchor.y - adjust.y) * (anchor.y - adjust.y) + (anchor.x - adjust.x) * (anchor.x - adjust.x));
                index++;
            }
            if (element.rotation != 0) {
                diff = {x: element.x, y: element.y + element.h};
            }
        } else if (element.type === "qR_Code") {
            element.w = Math.round((mouseState.x - diff.x)/graphics.getGrid) * graphics.getGrid;
            element.h = element.w
            element.y = Math.round((diff.y - element.h)/graphics.getGrid)*graphics.getGrid;

            let gap = Math.sqrt((anchor.x - adjust.x) * (anchor.x - adjust.x) + (anchor.y - adjust.y) * (anchor.y - adjust.y));
            let index = 0;
            while (gap > 1 && index < 10) {
                element.x = Math.round(element.x + (anchor.x - adjust.x));
                element.w = Math.round((mouseState.x - diff.x)/graphics.getGrid) * graphics.getGrid;;
                element.h = element.w;
                element.y = Math.round((diff.y + (anchor.y - adjust.y) - element.h)/graphics.getGrid)*graphics.getGrid;
                adjust = graphics.transformPoint({x: element.x, y: element.y + element.h}, element, false);
                gap = Math.sqrt((anchor.y - adjust.y) * (anchor.y - adjust.y) + (anchor.x - adjust.x) * (anchor.x - adjust.x));
                index++;
            }
            diff = {x: element.x, y: element.y + element.h};
        } else {  
            element.y = Math.round(mouseState.y/graphics.getGrid)*graphics.getGrid;
            element.w = Math.round((mouseState.x - diff.x)/graphics.getGrid)* graphics.getGrid;
            element.h = Math.round((diff.y - mouseState.y)/graphics.getGrid)* graphics.getGrid;
            
            let gap = Math.sqrt((anchor.x - adjust.x) * (anchor.x - adjust.x) + (anchor.y - adjust.y) * (anchor.y - adjust.y));
            let index = 0;
            while (gap > 1 && index < 10) {
                element.y = Math.round(mouseState.y/graphics.getGrid)*graphics.getGrid;
                element.x = Math.round(element.x + (anchor.x - adjust.x));
                element.w = Math.round(element.w + (anchor.x - adjust.x));
                element.h = Math.round(element.h + (anchor.y - adjust.y));
                adjust = graphics.transformPoint({x: element.x, y: element.y + element.h}, element, false);
                gap = Math.sqrt((anchor.y - adjust.y) * (anchor.y - adjust.y) + (anchor.x - adjust.x) * (anchor.x - adjust.x));
                index++;
            }
            diff = {x: element.x, y: element.y + element.h};
        }
    }
    
    //TODO: Fix Rotation Tranformation
    function swResize(element, mouseState) {
        let adjust = graphics.transformPoint({x: element.x + element.w, y: element.y}, element, false);
        if (element.type === "text") {
            while (Math.round(element.w) < Math.round((diff.x - mouseState.x)/graphics.getGrid)*graphics.getGrid) {
                element.size += 1;
                adjustTextSize(element);
            }
            while (Math.round(element.w) > Math.round((diff.x - mouseState.x)/graphics.getGrid)*graphics.getGrid && element.size > 0) {
                element.size -= 1;
                adjustTextSize(element);
            }
            element.x = Math.round(mouseState.x/graphics.getGrid) * graphics.getGrid;
            
            let gap = Math.sqrt((anchor.x - adjust.x) * (anchor.x - adjust.x) + (anchor.y - adjust.y) * (anchor.y - adjust.y));
            let index = 0;
            while (element.rotation != 0 && gap > 1 && index < 10) {
                element.x = Math.round((element.x + (anchor.x - adjust.x))/graphics.getGrid) * graphics.getGrid;
                element.y = Math.round(element.y + (anchor.y - adjust.y)); 
                adjust = graphics.transformPoint({x: element.x + element.w, y: element.y}, element, false);
                gap = Math.sqrt((anchor.y - adjust.y) * (anchor.y - adjust.y) + (anchor.x - adjust.x) * (anchor.x - adjust.x));
                index++;
            }
            if (element.rotation != 0) {
                diff = {x:element.x + element.w, y: element.y};
            }
        } else if (element.type === "qR_Code") {
            element.w = Math.round((diff.x - mouseState.x)/graphics.getGrid)*graphics.getGrid;
            element.h = element.w

            let gap = Math.sqrt((anchor.x - adjust.x) * (anchor.x - adjust.x) + (anchor.y - adjust.y) * (anchor.y - adjust.y));
            let index = 0;
            while (gap > 1 && index < 10) {
                element.y = Math.round(element.y + (anchor.y - adjust.y));
                element.x = Math.round((mouseState.x)/graphics.getGrid) * graphics.getGrid;
                element.w = Math.round(element.w + (anchor.x - adjust.x));
                element.h = element.w;
                adjust = graphics.transformPoint({x: element.x + element.w, y: element.y}, element, false);
                gap = Math.sqrt((anchor.y - adjust.y) * (anchor.y - adjust.y) + (anchor.x - adjust.x) * (anchor.x - adjust.x));
                index++;
            }
            diff = {x:element.x + element.w, y: element.y};
        } else { 
            element.x = Math.round(mouseState.x/graphics.getGrid) * graphics.getGrid;
            element.w = Math.round((diff.x - mouseState.x)/graphics.getGrid)*graphics.getGrid;
            element.h = Math.round((mouseState.y - diff.y)/graphics.getGrid)*graphics.getGrid;

            let gap = Math.sqrt((anchor.x - adjust.x) * (anchor.x - adjust.x) + (anchor.y - adjust.y) * (anchor.y - adjust.y));
            let index = 0;
            while (gap > 1 && index < 10) {
                element.y = Math.round(element.y + (anchor.y - adjust.y));
                element.x = Math.round((mouseState.x)/graphics.getGrid) * graphics.getGrid;
                element.w = Math.round(element.w + (anchor.x - adjust.x));
                element.h = Math.round(element.h + (anchor.y - adjust.y));
                adjust = graphics.transformPoint({x: element.x + element.w, y: element.y}, element, false);
                gap = Math.sqrt((anchor.y - adjust.y) * (anchor.y - adjust.y) + (anchor.x - adjust.x) * (anchor.x - adjust.x));
                index++;
            }
            diff = {x:element.x + element.w, y: element.y};
        }
    }
    

    // Working
    function seResize(element, mouseState) {
        // mouseState = graphics.transformPoint(mouseState, element, true);
        let adjust = graphics.transformPoint(element, element, false);
        if (element.type === "text") {
            while (Math.round(element.w) < Math.round((mouseState.x - diff.x)/graphics.getGrid) * graphics.getGrid) {
                element.size += 1;
                adjustTextSize(element);
            }
            while (Math.round(element.w) > Math.round((mouseState.x - diff.x)/graphics.getGrid) * graphics.getGrid && element.size > 0) {
                element.size -= 1;
                adjustTextSize(element);
            }
            let gap = Math.sqrt((anchor.x - adjust.x) * (anchor.x - adjust.x) + (anchor.y - adjust.y) * (anchor.y - adjust.y));
            let index = 0;
            while (element.rotation != 0 && gap > 1 && index < 10) {
                element.x = Math.round((element.x + (anchor.x - adjust.x))/graphics.getGrid) * graphics.getGrid;
                element.y = Math.round(element.y + (anchor.y - adjust.y)); 
                adjust = graphics.transformPoint({x: element.x, y: element.y}, element, false);
                gap = Math.sqrt((anchor.y - adjust.y) * (anchor.y - adjust.y) + (anchor.x - adjust.x) * (anchor.x - adjust.x));
                index++;
            }
            if (element.rotation != 0) {
                diff = {x:element.x, y: element.y};
            }
        } else if (element.type === "qR_Code") {
            element.w = Math.round((mouseState.x - diff.x)/graphics.getGrid)*graphics.getGrid;
            element.h = element.w

            let gap = Math.sqrt((anchor.x - adjust.x) * (anchor.x - adjust.x) + (anchor.y - adjust.y) * (anchor.y - adjust.y));
            let index = 0;
            while (gap > 1 && index < 1000) {
                element.w = Math.round((mouseState.x - diff.x)/graphics.getGrid) * graphics.getGrid;
                element.h = element.w;
                element.x = Math.round(element.x + (anchor.x - adjust.x));
                element.y = Math.round(element.y + (anchor.y - adjust.y));
                adjust = graphics.transformPoint(element, element, false);
                gap = Math.sqrt((anchor.y - adjust.y) * (anchor.y - adjust.y) + (anchor.x - adjust.x) * (anchor.x - adjust.x));
                index++;
            }
            diff = {x: element.x, y: element.y};
        } else {  
            element.w = Math.round((mouseState.x - diff.x)/graphics.getGrid) * graphics.getGrid;
            element.h = Math.round((mouseState.y - diff.y)/graphics.getGrid) * graphics.getGrid;
            
            let gap = Math.sqrt((anchor.x - adjust.x) * (anchor.x - adjust.x) + (anchor.y - adjust.y) * (anchor.y - adjust.y));
            let index = 0;
            while (gap > 1 && index < 1000) {
                element.w = Math.round((mouseState.x - diff.x)/graphics.getGrid) * graphics.getGrid;
                element.h = Math.round((mouseState.y - diff.y)/graphics.getGrid) * graphics.getGrid;
                element.x = Math.round(element.x + (anchor.x - adjust.x));
                element.y = Math.round(element.y + (anchor.y - adjust.y));
                adjust = graphics.transformPoint(element, element, false);
                gap = Math.sqrt((anchor.y - adjust.y) * (anchor.y - adjust.y) + (anchor.x - adjust.x) * (anchor.x - adjust.x));
                index++;
            }
            diff = {x: element.x, y: element.y};
        }
    }
    
    function resize(element, mouseState, graphics) {
        
        // console.log("MouseState: (" + mouseState.x + ", " + mouseState.y + ")");
        mouseState = graphics.transformPoint(mouseState, element, true);
        // console.log("MouseState: (" + mouseState.x + ", " + mouseState.y + ")");
        
        // graphics.drawRectangle({x: diff.x - 10, y: diff.y - 10, h: 20, w: 20, rotation: 0, color: "rgb(0, 0, 255)"});
        if (mouseState.x < diff.x && mouseState.y < diff.y) {
            canvas.style.cursor = "nw-resize";
            nwResize(element, mouseState);
        }
        if (mouseState.x > diff.x && mouseState.y < diff.y) {
            canvas.style.cursor = "ne-resize";
            neResize(element, mouseState);
        }
        if (mouseState.x < diff.x && mouseState.y > diff.y) {
            canvas.style.cursor = "sw-resize";
            swResize(element, mouseState);
        }
        if (mouseState.x > diff.x && mouseState.y > diff.y) {
            canvas.style.cursor = "se-resize";
            seResize(element, mouseState);
        }
    }

    function rotate(element, mouseState, graphics) {
        // mouseState = graphics.transformPoint(mouseState, element, true);
        let diffR = 0;
        let mouseR = 0;
        if (mouseState.x < center.x && diff.x - center.x != 0 && mouseState.x - center.x != 0) {
            diffR = Math.atan((diff.y - center.y)/(diff.x - center.x));
            mouseR = Math.atan((mouseState.y - center.y)/(mouseState.x - center.x));
        } else if (center.x - diff.x != 0 && center.x - mouseState.x != 0) {
            diffR = Math.atan((center.y - diff.y)/(center.x - diff.x));
            mouseR = Math.atan((center.y - mouseState.y)/(center.x - mouseState.x));
        } else {
            console.log("Skip!")
            return;
        }
        console.log("DiffR: " + diffR + "\t MouseR: " + mouseR);
        element.rotation = diff.rotation - (diffR - mouseR) * 180/Math.PI;
        if (mouseR > 1 && diffR < -1) {
            element.rotation += 180;
        } else if (mouseR < -1 && diffR > 1) {
            element.rotation -= 180;
        }
    }
    
    function selectElement(state) {
        for (let i = elements.length - 1; i >= 0; i--) {
            if (elements[i].x < state.x && state.x < elements[i].x + elements[i].w && elements[i].y < state.y && state.y < elements[i].y + elements[i].h) {
                currentElement = elements[i];
                updateInputs(elements[i]);
                
                diff.x = state.x - currentElement.x;
                diff.y = state.y - currentElement.y;
                center.x = currentElement.x + currentElement.w/2;
                center.y = currentElement.y + currentElement.h/2;
                return true;
            }
        }
        return false;
    }


    function update(elapsedTime, graphics) {
        let mouseState = mouse_input.getState();
        if (translate) {
            if (!mouseState.leftIsDown) {
                console.log("Translate!")
                canvas.style.cursor = "grab";
            } else {
                canvas.style.cursor = "grabbing";
            }
            if (!previousState.leftIsDown) {
                diff.x = mouseState.x;
                diff.y = mouseState.y;
            } 
            if (mouseState.leftIsDown && mouseState.x != previousState.x) {
                const translate = graphics.getTranslate;
                if (Math.round(diff.x - mouseState.x) != translate.x) {
                    translate.x = translate.x - (diff.x - mouseState.x);
                    if (translate.x > 600) {
                        translate.x = 600
                    }
                    if (translate.x < -600) {
                        translate.x = -600
                    }
                }
                if (Math.round(diff.y - mouseState.y) != translate.y) {
                    translate.y = translate.y - (diff.y - mouseState.y);
                    if (translate.y > 600) {
                        translate.y = 600
                    }
                    if (translate.y < -600) {
                        translate.y = -600
                    }
                }
            }
        } else {
        // Normal controls
            if (!mouseState.leftIsDown && currentElement) {
                graphics.detectCursor(currentElement, mouseState);
            } 
            if (diff.x != mouseState.x) {
                if (cursors.includes(canvas.style.cursor) && mouseState.leftIsDown) {
                    if (!previousState.leftIsDown) {
                        if (canvas.style.cursor === "nw-resize") {
                            diff = {x:currentElement.x + currentElement.w, y: currentElement.y + currentElement.h};
                            anchor = graphics.transformPoint(diff, currentElement, false);
                        }
                        if (canvas.style.cursor === "ne-resize") {
                            diff = {x:currentElement.x, y: currentElement.y + currentElement.h};
                            anchor = graphics.transformPoint(diff, currentElement, false);
                        }
                        if (canvas.style.cursor === "sw-resize") {
                            diff = {x: currentElement.x + currentElement.w, y: currentElement.y};
                            anchor = graphics.transformPoint(diff, currentElement, false);
                        }
                        if (canvas.style.cursor === "se-resize") {
                            diff = {x:currentElement.x, y: currentElement.y};
                            anchor = graphics.transformPoint(diff, currentElement, false);
                        } 
                    }
                    resize(currentElement, mouseState, graphics);
                } else if (canvas.style.cursor === "alias" && mouseState.leftIsDown) {
                    if (!previousState.leftIsDown) {
                        diff = {x: mouseState.x, y: mouseState.y, rotation: currentElement.rotation}
                        center = {x: currentElement.x + currentElement.w/2, y: currentElement.y + currentElement.h/2}
                    }
                    rotate(currentElement, mouseState, graphics);   
                    diff = {x: mouseState.x, y: mouseState.y, rotation: currentElement.rotation}
                } else {

                    if (!previousState.leftIsDown && mouseState.leftIsDown) {
                        selected = selectElement(mouseState);
                    }
                    if (previousState.leftIsDown && !mouseState.leftIsDown) {
                        selected = false;
                    }
                }
                if (selected) {
                    let grid = graphics.getGrid;
                    currentElement.x = Math.round((mouseState.x - diff.x)/grid) * grid; 
                    currentElement.y = Math.round((mouseState.y - diff.y)/grid) * grid; 
                    
                }
            }
        }
        
        updateInputs(currentElement);
        previousState.x = mouseState.x;
        previousState.y = mouseState.y;
        previousState.leftIsDown = mouseState.leftIsDown;
    }

    function render(elapsedTime, graphics) {
        let mouseState = mouse_input.getState()
        graphics.drawGrid();
        for (let i in elements) {
            if (elements[i].type === "box") {
                graphics.drawRectangle(elements[i]);
            }
            if (elements[i].type === "circle") {
                graphics.drawEllipse(elements[i]);
            }
            if (elements[i].type === "text") {
                graphics.drawText(elements[i]);
            }
            if (elements[i].type === "image" || elements[i].type === "qR_Code" || elements[i].type === "barcode") {

                if (elements[i].imageElement.src == "" || elements[i].image == "") {
                    elements[i].imageElement.src = "imageNotFound.png";
                } 
                graphics.drawImage(elements[i]);
            }
            if (elements[i].type === "textBox") {
                graphics.drawTextBox(elements[i])
            }
        }
        // Shows where to mouse
        if (mouseState.leftIsDown) {
            // graphics.drawRectangle({x:mouseState.x - 5/graphics.getZoom, y:mouseState.y - 5/graphics.getZoom, w: 10/graphics.getZoom, h:10/graphics.getZoom, rotation:0, color:"red"});
        }

        if (currentElement) {
            graphics.drawBoundry(currentElement);
            // graphics.drawMouse(currentElement, mouseState);
        }
        graphics.labelBoundry();
    }

    function saveElements() {
        let newElements = []
        for (let item of elements) {
            let newObject = {}
            for (let key of Object.keys(item)) {
                if (key !== "inputs" && key !== "imageElement") {
                    newObject[key] = item[key];
                }
            }
            newElements.push(newObject);
        }
        return JSON.stringify(newElements);
    }

    let api = {
        update: update,
        render: render,
        appendElement: appendElement,
        shiftBack: shiftBack,
        shiftForward: shiftForward,
        deleteElement: deleteElement,
        updateInputs: updateInputs,
        saveElements: saveElements,
    }
    return api;

}(MyGraphics.graphics, MyGraphics.mouse_input, MyGraphics.keyboard));