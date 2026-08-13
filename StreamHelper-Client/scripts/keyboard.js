import { MyElements, MyGraphics } from "./objects.js";

MyGraphics.keyboard = (function() {
    'use-strict';

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

    var previousState = {
        keys: {}
    }

    var commandEntries = {};

    function registerCommand(key, type, keyPressOnly, callback) {
        let dictKey = key + "," + type;
        commandEntries[dictKey] = {key, type, keyPressOnly, callback};
        previousState[key] = true;
    }

    function update(event) {
        // console.log(previousState[event.key]);
        for (let [key, command] of Object.entries(commandEntries)) {
            // console.log(command.key + " vs " + event.key + " = " + (event.key == command.key))
            if (event.key === command.key && event.type === command.type) {
                if (command.keyPressOnly && previousState[command.key]) {
                    command.callback();
                } else if (!command.keyPressOnly) {
                    command.callback();
                }
                if (event.type == "keyup") {
                    command.callback();
                }
            }
        }
        previousState[event.key] = event.type === "keydown" ? false : true;
    }

    const api = {
        update: update,
        registerCommand: registerCommand,
    }

    return api;
})();