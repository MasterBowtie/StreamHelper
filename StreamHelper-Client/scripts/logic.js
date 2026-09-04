import { MyDraw } from "./objects.js";

MyDraw.logic = (function (graphics, state, mouse, keyboard) {
    const cornerData = {
        nw: {
            cursor: "nw-resize",
            oppositeCorner: "se",
            direction: {x: -1, y: -1}
        },
        ne: {
            cursor: "ne-resize",
            oppositeCorner: "sw",
            direction: {x: 1, y: -1}
        },
        se: {
            cursor: "se-resize",
            oppositeCorner: "nw",
            direction: {x: 1, y: 1}
        },
        sw: {
            cursor: "sw-resize",
            oppositeCorner: "ne",
            direction: {x: -1, y: 1}
        },
    }
    
    const hoverState = {
        type: null,
        corner: null,
        cursor: "auto",
    }

    const translateState = {
        active: false,
        dragging: false,
        start: {
            x: 0,
            y: 0,
        }
    }

    const resizeState = {
        active: false,
        corner: null,
        fixedCorner: null,
        fixedPoint: null,
    }

    const rotationState = {
        active: false,
        startRotation: 0,
        startMouseAngle: 0,
    }

    const shiftState = {
        active: false
    }

    const moveState = {
        active: false,
        offset: {
            x: 0,
            y: 0,
        }
    }

    function bumpUp() {
        const current = state.getCurrentElement();

        if (!current) return;

        state.updateElement(current.id, {y: current.y - state.getGrid()})
    }

    function bumpDown() {
        const current = state.getCurrentElement();

        if (!current) return;

        state.updateElement(current.id, {y: current.y + state.getGrid()})
    }

    function bumpLeft() {
        const current = state.getCurrentElement();

        if (!current) return;

        state.updateElement(current.id, {x: current.x - state.getGrid()})
    }

    function bumpRight() {
        const current = state.getCurrentElement();

        if (!current) return;

        state.updateElement(current.id, {x: current.x + state.getGrid()})
    }

    function startTranslate(mousePosition) {
        translateState.active = true;
        mouse.setCursor("grab");
    }

    function startTranslateDrag(mousePosition, mouseState) {
        translateState.dragging = true;

        translateState.start = {
            x: mousePosition.x,
            y: mousePosition.y,
        };     

        mouse.setCursor("grabbing");
    }

    function translate(mousePosition, mouseState) {
        if (!translateState.active || !translateState.dragging) {
            return;
        }
        const dx = translateState.start.x - mousePosition.x;
        const dy = translateState.start.y - mousePosition.y;
        const translate = graphics.getTranslate();

        translate.x -= dx;
        translate.y -= dy;

        graphics.setTranslate(translate);
        state.render();
    } 

    function endTranslateDrag() {  
        translateState.dragging = false;
        mouse.setCursor("grab");
    }
    
    function endTranslate() {
        translateState.active = false;
        translateState.dragging = false;
        mouse.setCursor("auto");
    }

    // TODO: Handle Inputs
    function zoom(value) {
        const zoom = graphics.getZoom();
        const increment = zoom * 0.1 * value;

        
        // console.log(value,zoom + increment);
        graphics.setZoom(zoom + increment);
        state.render()
    }

    function getCorner(element, corner) {
        switch (corner) {
            case "nw":
                return {
                    x: element.x,
                    y: element.y
                }
            case "ne":
                return {
                    x: element.x + element.w,
                    y: element.y
                }
            case "se":
                return {
                    x: element.x + element.w,
                    y: element.y + element.h
                }
            case "sw":
                return {
                    x: element.x,
                    y: element.y + element.h
                }
        }
    }

    function getCenterOffset(element, fixedCorner) {
        switch (fixedCorner) {
            case "nw":
                return {
                    x: element.w/2,
                    y: element.h/2
                }
            case "ne":
                return {
                    x: -element.w/2,
                    y: element.h/2
                }
            case "se":
                return {
                    x: -element.w/2,
                    y: -element.h/2
                }
            case "sw":
                return {
                    x: element.w/2,
                    y: -element.h/2
                }
        }
    }

    function rotatePoint(x, y, rotation) {
        return {
            x: x * Math.cos(rotation) - y * Math.sin(rotation),
            y: x * Math.sin(rotation) + y * Math.cos(rotation)
        };
    }

    function startShift() {
        shiftState.active = true;
    }

    function endShift() {
        shiftState.active = false;
    }

    function startResize(element, corner) {
        // console.log(`START RESIZE:`, corner)
        const fixedCorner = cornerData[corner].oppositeCorner;
        const localPoint = getCorner(element, fixedCorner);
        const fixedPoint = graphics.transformPoint(localPoint, element, false);

        resizeState.active = true;
        resizeState.corner = corner;
        resizeState.fixedCorner = fixedCorner;
        resizeState.fixedPoint = fixedPoint;
    }

    function resizeFromCorner(element, mousePosition, corner) {
        mouse.setCursor(cornerData[corner].cursor);

        const grid = state.getGrid();
        const fixedCorner = cornerData[corner].oppositeCorner;
        const direction = cornerData[corner].direction;
        const fixedPoint = resizeState.fixedPoint;

        const rotation = element.rotation * Math.PI/180;

        // Mouse relative to the fixed world-space corner
        const dx = mousePosition.x - fixedPoint.x;
        const dy = mousePosition.y - fixedPoint.y;

        // Convert the mouse vector into the element's local axis
        const localX = dx * Math.cos(rotation) + dy * Math.sin(rotation);
        const localY = -dx * Math.sin(rotation) + dy * Math.cos(rotation);


            
        let w;
        let h;
        let text_size

        if (element.type === "text") {
            // TODO
            w = element.w;
            h = element.h;
            text_size = element.properties.text_size;

            const targetWidth =
                Math.round(
                    Math.abs(localX * direction.x) / grid
                ) * grid;

            while (Math.round(w) < targetWidth) {
                text_size += 1;
                const measured = graphics.measureText({...element.properties, text_size});
                w = measured.w;
                h = measured.h;
            }
            
            while (Math.round(w) > targetWidth && text_size > 0) {
                text_size  -= 1;
                const measured = graphics.measureText({...element.properties, text_size});
                w = measured.w;
                h = measured.h;
            }
        } else if ((element.type === "image" || element.type === "video") && !shiftState.active) {
            // TODO
            const aspectRatio = element.w / element.h;
            h = Math.round((w/aspectRatio)/grid)* grid;
            w = h * aspectRatio;
            // preserve aspect ratio
        } else {
            // Calculate new dimensions
            w = Math.round((localX * direction.x)/grid) * grid;
            h = Math.round((localY * direction.y)/grid) * grid;
        }

        // // Find the center relative to fixed corner
        const offset = getCenterOffset(element, fixedCorner);

        // Rotate that offset into world space
        const rotateOffset = rotatePoint(offset.x, offset.y, rotation);

        const center = {
            x: fixedPoint.x + rotateOffset.x,
            y: fixedPoint.y + rotateOffset.y
        }

        // Convert center back to the element's x/y representation
        const x = Math.round((center.x - w / 2) / grid) * grid;
        const y = Math.round((center.y - h / 2) / grid) * grid;
        // const x = fixedPoint.x;
        // const y = fixedPoint.y;

        // se transform
        

        const changes = {x, y, w, h};
        if (text_size !== undefined) {
            changes.properties = {text_size};
        }

        state.updateElement(element.id, changes);
    }

    function endResize() {
        resizeState.active = false;
        resizeState.corner = null;
        resizeState.fixedCorner = null;
        resizeState.fixedPoint = null;
    }

    function resize(element, mousePosition) {
        if (!resizeState.active) return;

        resizeFromCorner(element, mousePosition, resizeState.corner);
    }

    function startRotate(element, mousePosition) {
        rotationState.active = true,
        rotationState.startRotation = element.rotation;

        const centerX = element.x + element.w/2;
        const centerY = element.y + element.h/2;

        rotationState.startMouseAngle = Math.atan2(mousePosition.y - centerY, mousePosition.x - centerX);
    }

    function rotate(element, mousePosition) {
        if (!rotationState.active) return;

        const centerX = element.x + element.w/2;
        const centerY = element.y + element.h/2;

        const mouseAngle = Math.atan2(mousePosition.y - centerY, mousePosition.x - centerX);
        const angleDifference = mouseAngle - rotationState.startMouseAngle;

        const rotation = rotationState.startRotation + angleDifference * 180/Math.PI;

        state.updateElement(element.id, {rotation})
    }

    function endRotate() {
        rotationState.active = false;
    };

    function startMove(element, mousePosition) {
        moveState.active = true;
        moveState.offset = {
            x: mousePosition.x - element.x,
            y: mousePosition.y - element.y,
        }

    }

    function move(element, mousePosition) {
        if (!moveState.active) return;

        const grid = state.getGrid();

        const x = Math.round((mousePosition.x - moveState.offset.x)/ grid) * grid;
        const y = Math.round((mousePosition.y - moveState.offset.y)/ grid) * grid;

        state.updateElement(element.id, {x, y});
    }

    function endMove() {
        moveState.active = false;
    }

    function selectElement(mousePosition) {
        // console.log("SELECT ELEMENT:");
        const elements = state.getElements();

        for (let i = elements.length - 1; i >= 0; i--) {
            const element = elements[i];

            const localMouse = graphics.transformPoint(mousePosition, element, true);

            if (pointInBox(localMouse, element.x, element.y, element.w, element.h)
            ) {
                state.setCurrentElement(element.id);
                return true;
            }
        }
        return false;
    }

    function pointInBox(point, x, y, w, h) {
    return (
        point.x >= x &&
        point.x <= x + w &&
        point.y >= y &&
        point.y <= y + h
    );
    }

    function updateHover(mousePosition) {
        if (translateState.active || translateState.dragging || resizeState.active || rotationState.active) return;
        hoverState.type = null;
        hoverState.corner = null;
        const element = state.getCurrentElement();

        if (!element) {
            return;
        }

        const localMouse = graphics.transformPoint(mousePosition, element, true);
        const s = 5/graphics.getZoom();

        const corners = {
            nw: {
                x: element.x,
                y: element.y
            },
            ne: {
                x: element.x + element.w,
                y: element.y
            },
            se: {
                x: element.x + element.w,
                y: element.y + element.h
            },
            sw: {
                x: element.x,
                y: element.y + element.h
            },
        }

        const rotationAreas = {
            nw: {
                x: element.x - 2 * s,
                y: element.y - 2 * s,
            },
            ne: {
                x: element.x + element.w,
                y: element.y - 2 * s
            },
            se: {
                x: element.x + element.w,
                y: element.y + element.h
            },
            sw: {
                x: element.x - 2 * s,
                y: element.y + element.h
            },
        }

        // Resize handles
        for (const [corner, point] of Object.entries(corners)) {
            if (pointInBox(localMouse, point.x - s, point.y - s, 2*s, 2*s)) {
                hoverState.type = "resize";
                hoverState.corner = corner;
                mouse.setCursor(cornerData[corner].cursor);
                return;
            }
        }

        // Rotation Handles
        for (const [corner, point] of Object.entries(rotationAreas)) {
            if (pointInBox(localMouse, point.x-s, point.y-s, s*4, s*4)) {
                hoverState.type = "rotate";
                hoverState.corner = corner;
                mouse.setCursor("alias");
                return;
            }
        }

        // Element Body
        if (pointInBox(localMouse, element.x, element.y, element.w, element.h)) {
            hoverState.type = "move";
            hoverState.corner = null;
            mouse.setCursor("move");
            return;
        }
        mouse.setCursor("auto")
    }

    function getWorldMousePosition(mouseState) {
        const zoom = graphics.getZoom();
        const translate = graphics.getTranslate();

        return {
            x: Math.round(mouseState.x / zoom - translate.x),
            y: Math.round(mouseState.y / zoom - translate.y),
        }
    }

    function onMouseDown(mouseState) {
        const mousePosition = getWorldMousePosition(mouseState)
        updateHover(mousePosition);

        if (translateState.active && !translateState.dragging) {
            startTranslateDrag(mousePosition, mouseState);
            return;
        }

        const element = state.getCurrentElement();

        if (element) {
            switch (hoverState.type) {
                case "resize":
                    startResize(element, hoverState.corner);
                    return;
                
                case "rotate": 
                    startRotate(element, mousePosition);
                    return;
                
                case "move":
                    startMove(element, mousePosition);
                    return;
            }
        }

        if (selectElement(mousePosition)) {
            startMove(state.getCurrentElement(), mousePosition);
        }
    }

    function onMouseUp(mouseState) {
        const mousePosition = getWorldMousePosition(mouseState)
        if (translateState.dragging) {
            endTranslateDrag();
        }

        if (resizeState.active) {
            endResize();
        }

        if (rotationState.active) {
            endRotate();
        }

        if (moveState.active) {
            endMove();
        }

        updateHover(mousePosition);
    }

    function onMouseMove(mouseState) {
        const mousePosition = getWorldMousePosition(mouseState)
        updateHover(mousePosition);

        translate(mousePosition, mouseState);
        resize(state.getCurrentElement(), mousePosition);
        rotate(state.getCurrentElement(), mousePosition);
        move(state.getCurrentElement(), mousePosition);
    }

    function initialize() {
        console.log("Connecting Inputs...");
        // Keyboard 
        keyboard.registerCommand("w", "keydown", false, bumpUp);
        keyboard.registerCommand("s", "keydown", false, bumpDown);
        keyboard.registerCommand("a", "keydown", false, bumpLeft);
        keyboard.registerCommand("d", "keydown", false, bumpRight);

        keyboard.registerCommand("=", "keydown", false, ()=> zoom(1));
        keyboard.registerCommand("-", "keydown", false, ()=>zoom(-1));

        keyboard.registerCommand(" ", "keydown", true, startTranslate);
        keyboard.registerCommand(" ", "keyup", true, endTranslate);
        keyboard.registerCommand("Shift", "keydown", true, startShift);
        keyboard.registerCommand("Shift", "keyup", true, endShift);

        keyboard.registerCommand("ArrowUp", "keydown", false, bumpUp);
        keyboard.registerCommand("ArrowDown", "keydown", false, bumpDown);
        keyboard.registerCommand("ArrowLeft", "keydown", false, bumpLeft);
        keyboard.registerCommand("ArrowRight", "keydown", false, bumpRight);


        // Mouse
        mouse.registerCommand("mousedown", 0, (_, mouseState) => onMouseDown(mouseState))
        mouse.registerCommand("mousemove", null, (_, mouseState) => onMouseMove(mouseState))
        mouse.registerCommand("mouseup", 0, (_, mouseState) => onMouseUp(mouseState))
        mouse.registerCommand("wheel", null, (e, mouseState) => zoom(-Math.round(e.deltaY/100)))
        

        state.render();
    }

    const api = {
        initialize,
    }

    return api;

}(MyDraw.graphics, MyDraw.state, MyDraw.mouse, MyDraw.keyboard));