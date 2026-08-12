import { MyGraphics, MyElements } from "./objects.js";

MyGraphics.mouse_input = (function(graphics) {
    'use strict';

    var mainCanvas = document.getElementById("canvas-main");
    var context = mainCanvas.getContext('2d', { alpha: false});     
    var mouseState = {
        x: 0,
        y: 0,
        leftIsDown: false,
    }

    //left button 0
    //wheel button 1
    //right button 2
    mainCanvas.addEventListener('mousedown', event => {
        if (event.button === 0) {
            mouseState.leftIsDown = true;
        }
    });
    
    //button 0
    mainCanvas.addEventListener('mousemove', event => {
        getMousePosition(mainCanvas, event);
    })
    
    mainCanvas.addEventListener('mouseup', event => {
        if (event.button === 0) {
            mouseState.leftIsDown = false;
        }
    })

    //button 0
    mainCanvas.addEventListener("wheel", event => {
        // console.log(event.deltaY > 0);
        event.preventDefault();
        let zoom = graphics.getZoom
        if (event.deltaY > 0) {
            zoom -= .1;
            if (zoom < .33) {
                graphics.setZoom(.33);
            } else {
                graphics.setZoom(zoom);
            }
        } 
        if (event.deltaY < 0) {            
            zoom += .1;
            if (zoom > 8) {
                graphics.setZoom(8);
            } else {
                graphics.setZoom(zoom);
            }
        }

        // FIXME
        // let input = document.getElementById("zoom");
        // input.value = zoom;
        // input.dispatchEvent(new InputEvent("input"));
    })

    function getMousePosition(canvas, event) {
        var rect = canvas.getBoundingClientRect();
        mouseState.x = Math.round((event.clientX - rect.left)/ graphics.getZoom - (graphics.getTranslate.x) );
        // mouseState.x = Math.round((event.clientX - rect.left)/ graphics.getZoom - (canvas.width/2 - label.w/2));
        mouseState.y = Math.round((event.clientY - rect.top)/ graphics.getZoom - (graphics.getTranslate.y));
        // mouseState.y = Math.round((event.clientY - rect.top)/ graphics.getZoom - (canvas.height/2 - label.h/2));
    }


    function getState() {
        return mouseState; 
    }

    var api = {
        getState: getState,
    }

    return api;
}(MyGraphics.graphics)); 