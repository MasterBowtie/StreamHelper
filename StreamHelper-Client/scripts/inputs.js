import { MyDraw } from "./objects.js";

MyDraw.inputs = (function(state) {

    let reactCallbacks = {};
    let onDelete = null;

    function attachDeleteCallback(callback) {
        onDelete = callback;
    }

    function updateDelete(id) {
        console.log("DELETE", id);
        if (onDelete) {
            onDelete(id);
        }
    }

    // register callback
    function registerCallback(id, callback) {  
        reactCallbacks[id] = callback;
    }

    function unregisterCallback(id) {
        delete reactCallbacks[id];
    }

    function getValue(element, property) {
        const parts = property.split(".");

        let value = element;

        for (const part of parts) {
            value = value?.[part];
        }
        return value;
    }

    // React -> Draw
    function updateState(id, property, value) {
        const parts = property.split(".");

        if (parts.length === 1) {
            state.updateElement(id, {
                [property]: value
            });
            return;
        }

        const element = state.getElement(id);

        const properties = {
            ...element.properties, 
            [parts[1]]: value
        };
        
        state.updateElement(id, {properties});
    }

    // Draw -> React
    function updateReact(element) {
        const callback = reactCallbacks[element.id];
        
        if (!callback) {
            return;
        }

        callback({
            ...element,
            properties: {
                ...element.properties
            }
        });
    }

    function initialize() {
        reactCallbacks = {};
        onDelete = null;
    }

    const api = {
        updateState,
        updateReact,
        registerCallback,
        unregisterCallback,
        initialize,
        attachDeleteCallback,
        updateDelete,
    }

    return api;

}(MyDraw.state));