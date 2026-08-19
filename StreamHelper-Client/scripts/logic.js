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

    var previousMouse = {x: 0, y: 0, buttons: []};
    
    var selected = false;
    var translating = false;

    var diff = {x: 0, y:0};
    var anchor = {x: 0, y: 0};
    var center = {x: 0, y: 0};

    const translateState = {
        active: false,
        dragging: false,
        startMouse: {
            x: 0,
            y: 0,
        },
        startTranslate: {
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

    const moveState = {
        active: false,
        offset: {
            x: 0,
            y: 0,
        }
    }

    function bumpUp() {
        state.moveCurrentElement(0, -graphics.getGrid());
    }

    function bumpDown() {
        state.moveCurrentElement(0, graphics.getGrid());
    }

    function bumpLeft() {
        state.moveCurrentElement(-graphics.getGrid(), 0);
    }

    function bumpRight() {
        state.moveCurrentElement(graphics.getGrid(), 0);
    }

    function startTranslate(mouseState) {
        translateState.active = true;
        mouse.setCursor("grab");
    }

    function startTranslateDrag(mouseState) {
        translateState.dragging = true;

        translateState.startMouse = {
            x: mouseState.x,
            y: mouseState.y,
        };

        translateState.startTranslate = { ...graphics.getTranslate() }

        mouse.setCursor("grabbing");
    }

    function translate(mouseState) {
        if (!translateState.active || !translateState.dragging) {
            return;
        }

        const dx = mouseState.x - translateState.startMouse.x;
        const dy = mouseState.y - translateState.startMouse.y;

        graphics.setTranslate({
            x: translateState.startTranslate.x + dx,
            y: translateState.startTranslate.y + dy,
        })
    } 

    function endTranslateDrag() {
        translateState.dragging = false;
    }
    
    function endTranslate() {
        translateState.active = false;
        translateState.dragging = false;
        mouse.setCursor("auto");
    }

    // TODO: Handle Inputs
    function zoomOut() {
        const zoom = graphics.getZoom();
        graphics.setZoom(zoom * 0.9);
    }
    
    // TODO: Handle Inputs
    function zoomIn() {
        const zoom = graphics.getZoom();
        graphics.setZoom(zoom * 1.1);
    }

    function adjustTextSize(element) {
        context.font = element.size + "px " + element.font;
        element.h = context.measureText("m").width;
        element.w = context.measureText(element.content).width;
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

    function startResize(element, corner) {
        const fixedCorner = cornerData[corner].oppositeCorner;
        const localPoint = getCorner(element, corner);
        const fixedPoint = graphics.transformPoint(localPoint, element, false);

        resizeState.active = true;
        resizeState.corner = corner;
        resizeState.fixedCorner = fixedCorner;
        resizeState.fixedPoint = fixedPoint;
    }

    function resizeFromCorner(element, mouseState, corner) {
        mouse.setCursor(cornerData[corner].cursor);
        const fixedCorner = cornerData[corner].oppositeCorner;
        const direction = cornerData[corner].direction;
        const fixedPoint = resizeState.fixedPoint;

        const rotation = element.rotation * Math.PI/180;

        // Mouse relative to teh fixed world-space corner
        const dx = mouseState.x - fixedPoint.x;
        const dy = mouseState.y - fixedPoint.y;

        // Convert the mouse vector into the element's local axis
        const localX = dx * Math.cos(rotation) + dy * Math.sin(rotation);
        const localY = -dx * Math.sin(rotation) + dy * Math.cos(rotation);

        // Calculate new dimensions
        element.w = localX * direction.x;
        element.h = localY * direction.y;
    
        // Find the center relative to fixed corner
        const offset = getCenterOffset(element, fixedCorner);

        // Rotate that offset into world space
        const rotateOffset = rotatePoint(offset.x, offset.y, rotation);

        const center = {
            x: fixedPoint.x + rotateOffset.x,
            y: fixedPoint.y + rotateOffset.y
        }

        // Convert center back to the element's x/y representation
        element.x = center.x - element.w / 2;
        element.y = center.y - element.h / 2;
    }

    function endResize() {
        resizeState.active = false;
        resizeState.corner = null;
        resizeState.fixedCorner = null;
        resizeState.fixedPoint = null;
    }

    function resize(element, mouseState) {
        if (!resizeState.active) return;

        resizeFromCorner(element, mouseState, resizeState.corner);
    }

    function startRotate(element, mouseState) {
        rotationState.active = true,
        rotationState.startRotation = element.rotation;

        const centerX = element.x + element.w/2;
        const centerY = element.y + element.h/2;

        rotationState.startMouseAngle = Math.atan2(mouseState.y - centerY, mouseState.x - centerX);
    }

    function rotate(element, mouseState) {
        if (!rotationState.active) return;

        const centerX = element.x + element.w/2;
        const centerY = element.y + element.h/2;

        const mouseAngle = Math.atan2(mouseState.y - centerY, mouseState.x - centerX);
        const angleDifference = mouseAngle - rotationState.startMouseAngle;

        element.rotation = rotationState.startRotation + angleDifference * 180/Math.PI;
    }

    function endRotate() {
        rotationState.active = false;
    };

    function startMove(element, mouseState) {
        moveState.active = true;
        moveState.offset = {
            x: mouseState.x - element.x,
            y: mouseState.y - element.y,
        }

    }

    function move(element, mouseState) {
        if (!moveState.active) return;

        const grid = state.getGrid();

        element.x = Math.round((mouseState.x - moveState.offset.x)/ grid) * grid;
        element.y = Math.round((mouseState.y - moveState.offset.y)/ grid) * grid;
    }

    function endMove() {
        moveState.active = false;
    }

    function selectElement() {
        const elements = state.getElements();

        for (let i = elements.length - 1; i >= 0; i--) {
            const element = elements[i];

            const localMouse = graphics.transformPoint(mouseState, element, true);

            if (localMouse.x >= element.x &&
                localMouse.x <= element.x + element.w &&
                localMouse.y >= element.y &&
                localMouse.y <= element.y + element.h
            ) {
                state.setCurrentElement(element);
                return true;
            }
        }

        state.setCurrentElement(null);
        return false;
    }

    function updateHover(mouseState) {
        const element = state.getCurrentElement();

        if (!element) {
            mouse.setCursor("auto");
            return null;
        }

        // Check resize handles
        // Check rotation handles
        // Check actual rendered element
        // Set cursor
        // Return hover information -> where?
    }

    function onMouseDown(mouseState) {

    }

    function onMouseUp(mouseState) {

    }


    function onMouseMove(mouseState) {
        if (translateState.active) {
            updateTranslate(mouseState);
            return;
        }

        if (resizeState.active) {
            resize(state.getCurrentElement(), mouseState);
        }

        if (rotationState.active) {
            rotate(state.getCurrentElement(), mouseState);
            return;
        }

        if (moveState.active) {
            move(state.getCurrentElement(), mouseState);
            return;
        }

        updateHover(mouseState);
    }


    const api = {
        bumpUp,
        bumpDown,
        bumpLeft,
        bumpRight,
        startTranslate,
        endTranslate,
    }

    return api;

}(MyDraw.graphics, MyDraw.state, MyDraw.mouse, MyDraw.keyboard));