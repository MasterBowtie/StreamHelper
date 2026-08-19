import { MyDraw } from "./objects.js";

MyDraw.state = (function () {
    // Document State
    const elements = [];
    
    // Editor State
    var currentElement = null;

    var grid = 1;
    var onGridChange = null;

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
        return elements;
    }

    function getCurrentElement() {
        return {...currentElement};
    }

    function setCurrentElement(value) {

    }

    // FIXME
    function moveCurrentElement(dx, dy) {

    }

    function addElement(element) {
        elements.push(element);
    }

    function deleteElement(element) {
        let index = elements.indexOf(element);

        if (index !== -1) {
            elements.splice(index, 1);
        }
        
        if (currentElement === element) {
            currentElement = null;
        }
    }

    function shiftForward(element) {
        const index = elements.indexOf(element);

        if (index === -1) {
            return;
        }

        currentElement = element;

        if (index < elements.length - 1) {
            [elements[index], elements[index + 1]] = [elements[index+1], elements[index]];
        }
    }

    function shiftBack(element) {
        const index = elements.indexOf(element);

        if (index === -1) {
            return;
        }

        currentElement = element;

        if (index > 0) {
            [elements[index], elements[index-1]] = [elements[index-1], elements[index]];
        }
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

    const api = {
        getGrid,
        setGrid,
        setOnGridChange,
        getElements,
        getCurrentElement,
        setCurrentElement,
        addElement,
        deleteElement,
    }

    return api;
}());