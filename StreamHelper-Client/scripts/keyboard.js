import { MyDraw } from "./objects.js";

MyDraw.keyboard = (function() {
    'use strict';

    var previousState = {};
    var commandEntries = {};

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
        let dictKey = `${key},${type}`;
        commandEntries[dictKey] = {key, type, keyPressOnly, callback};
        previousState[key] = true;
    }

    function update(event) {
        for (const command of Object.entries(commandEntries)) {
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

    const api = {
        update,
        registerCommand,
    }

    return api;
})();