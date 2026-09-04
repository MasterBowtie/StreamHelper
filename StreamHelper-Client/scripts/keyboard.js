import { MyDraw } from "./objects.js";

MyDraw.keyboard = (function() {
    'use strict';

    let previousState = {};
    let commandEntries = {};

    window.addEventListener("keydown", (event) => {
        if (document.activeElement.tagName == "BODY") {
            event.preventDefault();
            update(event);
        }
    });

    window.addEventListener("keyup", (event) => {
        if (document.activeElement.tagName == "BODY") {
            event.preventDefault();
            update(event);
        }
    });

    function registerCommand(key, type, keyPressOnly, callback) {
        let dictKey = `${key}-${type}`;
        commandEntries[dictKey] = {key, type, keyPressOnly, callback};
        previousState[key] = true;
    }

    function update(event) {
        for (const [dictKey, command] of Object.entries(commandEntries)) {
            
            if (event.key !== command.key || event.type !== command.type) {
                continue;
            }

            if (command.keyPressOnly) {
                if (previousState[command.key]) {
                    command.callback();
                }
            } else {
                command.callback();
            }

            if (event.type == "keyup") {
                command.callback();
            }
        }

        previousState[event.key] = event.type === "keydown" ? false : true;
    }

    function initialize() {
        commandEntries = {};
        previousState = {};
    }

    const api = {
        update,
        registerCommand,
        initialize,
    }

    return api;
})();