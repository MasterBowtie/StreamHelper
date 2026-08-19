import { MyDraw } from "./objects.js";

MyDraw.mouse = (function() {
    'use strict';

    const canvas = document.getElementById("canvas-main");
  
    const mouseState = {
        x: 0,
        y: 0,
        cursor: "auto",
        buttons: [],
    }

    const commandEntries = [];

    canvas.addEventListener("mousedown", event => {
        update(event);
    })

    canvas.addEventListener("mousemove", event => {
        update(event);
    })

    canvas.addEventListener("mouseup", event => {
        update(event);
    })

    canvas.addEventListener("wheel", event => {
        event.preventDefault();
        update(event);
    })

    function registerCommand(button, type, callback) {
        commandEntries.push({
            button, type, callback
        });
    }

    function update(event) {
        updateState(event);

        for (const command of commandEntries) {
            if (event.type === command.type &&
                (command.button === null || event.button === command.button)
            ) {
                command.callback(event, mouseState);
            }
        }
    }

    function updateState(event) {
        const rect = canvas.getBoundingClientRect();

        if (event.type === "mousedown") {
            mouseState.buttons[event.button] =  true;
        }

        if (event.type === "mouseup") {
            mouseState.buttons[event.button] = false;
        }

        if (event.type === "mousemove") {
            mouseState.x = event.clientX - rect.left;
            mouseState.y = event.clientY - rect.top;
        }
    }

    function getState() {
        return {...mouseState, 
            buttons: [...mouseState.buttons]};
    }

    function setCursor(value) {
        canvas.style.cursor = value;
        mouseState.cursor = value;
    }

    const api = {
        update,
        registerCommand,
        getState,
        setCursor,
    }

}()); 