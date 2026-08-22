import { MyDraw } from "./objects.js";

MyDraw.state = (function (graphics) {
    // Document State
    const elements = [];
    
    // Editor State
    var currentElement = null;
    var nextId = 0;
    var nextOrder = 0;

    var grid = 1;
    var onGridChange = null;
    var nextId = 0;

    function getGrid() {
        return grid;
    }

    function setGrid(value) {
        grid = value;

        if (onGridChange) {
            onGridChange(value);
        }
    }

    function setOnGridChange(callback) {
        onGridChange = callback;
    }

    function getElements() {
        return elements.map(element => ({
            id: element.id,
            order: element.order,
            x: element.x,
            y: element.y,
            w: element.w,
            h: element.h,
            rotation: element.rotation
        }));
    }

    function getCurrentElement() {
        if (!currentElement) return;

        return {
            id: currentElement.id,
            order: currentElement.order,
            type: currentElement.type,
            x: currentElement.x,
            y: currentElement.y,
            w: currentElement.w,
            h: currentElement.h,
            rotation: currentElement.rotation,
        }
    }

    function setCurrentElement(id) {
        currentElement = elements.find(element => element.id === id) || null;
        render();
    }

    function updateElement(id, changes) {
        const element = elements.find(element => element.id === id);

        if (!element) {
            return false;
        }

        const {properties, ...elementChanges} = changes;

        Object.assign(element, elementChanges);

        if (properties) {
            Object.assign(element.properties, properties);
        }

        normalizeElement(element)
        render();
        return true;
    }

    function addElement(type) {
        const element = {
            id: `${type}_${nextId}`,
            order: nextId++,
            name: "New " + type.charAt(0).toUpperCase() + type.slice(1).replace("_", " "),
            type: type,
            x: 0,
            y: 0,
            w: 100,
            h: 100,
            rotation: 0,
        }

        const properties = {};

        switch(type) {
            case "box":
                properties.radii = 0;
                properties.color = "black";

                break;
            
            case "circle":
                properties.color = "black";
                break;

            case "text":
                properties.content = "New " + type.charAt(0).toUpperCase() + type.slice(1).replace("_", " ");
                properties.color = "black";
                properties.font = "Arial";
                properties.text_size = 20;
                const measured = graphics.measureText(properties);
                element.w = measured.w;
                element.h = measured.h;
                break;

            case "image":
                properties.alpha = 100;
                properties.filepath = "";
                element.imageElement = document.createElement("img");
                element.imageElement.src = properties.filepath;
                break;

            case "textBox":
                properties.content = "New " + type.charAt(0).toUpperCase() + type.slice(1).replace("_", " ");
                properties.color = "black";
                properties.font = "Arial";
                properties.text_size = 20;
                properties.spacing = 0;
                break;

            case "video":
                properties.alpha = 100;
                properties.filepath = "";
                properties.autoplay = true;
                properties.loop = false;
                properties.muted = false;

                element.videoElement = document.createElement("video");
                element.videoElement.src = properties.filepath;
                break;
        }
        element.properties = properties;
        elements.push(element);

        render();
        return element.id;
    }

    function deleteElement(id) {
        const index = elements.findIndex(element => element.id === id);

        if (index === -1) return;

        const deleteOrder = elements[index].order;
         
        elements.splice(index, 1);
        
        for (const elements of elements) {
            if (element.order > deleteOrder) {
                element.order--;
            }
        }

        if (currentElement?.id === id) {
            currentElement = null;
        }
    }

    function shiftForward(id) {
        const element = elements.find(element => element.id === id);

        if (!element) return;

        const next = elements.find(candidate => candidate.order === element.order + 1);

        if (!next) return;

        currentElement = element;

        [element.order, next.order] = [next.order, element.order];
    }

    function shiftBackward(id) {
        const element = elements.find(element => element.id === id);

        if (!element) return;

        const next = elements.find(candidate => candidate.order === element.order - 1);

        if (!next) return;

        currentElement = element;

        [element.order, next.order] = [next.order, element.order];
    }

    function normalizeElement(element) {
        if (!element) return;

        // Normalize rotation to [-180, 180]
        if (element.rotation !== undefined) {
            element.rotation = ((element.rotation + 180) % 360 + 360) % 360 - 180;
        }

        if (element.w < 0) {
            element.x += element.w;
            element.w = -element.w;
        }

        if (element.h < 0) {
            element.y += element.h;
            element.h = -element.h;
        }
    }

    function render() {
        graphics.clear();

        graphics.drawGrid(grid);

        const renderElements = [...elements].sort((a,b) => a.order - b.order);

        for (const element of renderElements) {
            switch(element.type) {
                case "box":
                    graphics.drawRectangle(element)
                    break;

                case "circle":
                    graphics.drawEllipse(element);
                    break;

                case "text":
                    graphics.drawText(element);
                    break;

                case "textbox":
                    graphics.drawTextbox(element);
                    break;
                
                case "image":
                    graphics.drawImage(element);
                    break;

                case "video":
                    graphics.drawVideo(element);
                    break;
            }
        }
        
        if (currentElement) {
            graphics.objectBoundary(currentElement);
        }

        graphics.drawBoundary();
    }

    function exportElements() {
        const newElements = [];

        for (const element of elements) {
            const newElement = {};

            for (const key of Object.keys(element)) {
                if (key !== "imageElement" && key !== "videoElement") {
                    newElement[key] = element[key];
                }
            }

            newElements.push(newElement);
        }

        return JSON.stringify(newElements);
    }

    const api = {
        // Grid
        getGrid,
        setGrid,
        setOnGridChange,

        // Elements
        getElements,
        getCurrentElement,
        setCurrentElement,
        updateElement,
        addElement,
        deleteElement,
        shiftForward,
        shiftBackward,
        normalizeElement,

        // Extra
        exportElements,
        render,

    }

    render();

    return api;
}(MyDraw.graphics));