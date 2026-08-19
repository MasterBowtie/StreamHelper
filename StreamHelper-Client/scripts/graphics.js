import { MyDraw } from "./objects.js";

MyDraw.graphics = (function() {
    'use strict'

    // ---------------------------------
    // Canvas
    // ---------------------------------
    
    var canvas = document.getElementById('canvas-main');
    var context = canvas.getContext('2d');
    
    function resize() {
        canvas = document.getElementById('canvas-main');
        context = canvas.getContext('2d');
        
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    
    // ---------------------------------
    // View State
    // ---------------------------------
    
    var zoom = 1;
    var boundary = {h: 600, w: 600}
    var translate = {x: 100, y: 100}
    
    // ---------------------------------
    // View State API
    // ---------------------------------

    var onZoomChange = null;
    var onBoundaryChange = null;
    var onTranslateChange = null;

        function getZoom() {
        return zoom;
    }

    function setZoom(value) {
        zoom = value;

        if (onZoomChange) {
            onZoomChange(zoom);
        }
    }
    
    function setOnZoomChange(callback) {
        onZoomChange = callback;
    }

    function getBoundary() {
        return {...boundary};
    }

    function setBoundary(value) {
        boundary = value;

        if (onBoundaryChange) {
            onBoundaryChange(value);
        }
    }

    function setOnBoundaryChange(callback) {
        onBoundaryChange = callback
    }

    function getTranslate() {
        return {...translate}
    }

    function setTranslate(value) {
        translate = value;
        
        if (onTranslateChange) {
            onTranslateChange(value);
        }
    }

    function setOnTranslateChange(callback) {
        onTranslateChange = callback;
    }

    // ---------------------------------
    // Coordinate Conversion
    // ---------------------------------

    /**
     * Rotates a point around the center of an element.
     *
     * inverse = false:
     *     Apply element rotation.
     *
     * inverse = true:
     *     Remove element rotation.
     */
    function transformPoint(point, element, inverse=false) {
        const angle = element.rotation * Math.PI / 180;
        const rotation = inverse ? -angle : angle;

        const centerX = element.x + element.w / 2;
        const centerY = element.y + element.h / 2;

        const dx = point.x - centerX;
        const dy = point.y - centerY;

        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);

        return {
            x: centerX + dx * cos - dy * sin,
            y: centerY + dx * sin + dy * cos
        };
    }

    // ---------------------------------
    // Rendering
    // ---------------------------------

    function clear() {
        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.restore();
        context.setTransform(zoom, 0, 0, zoom, translate.x * zoom, translate.y * zoom);
    }

    function drawGrid(grid) {
        if (grid <= 1) return;
        
        context.save();

        context.lineWidth = 0.1;
        context.strokeStyle = 'rgb(0, 0, 0)';
        context.beginPath();

        const left = -translate.x;
        const top = -translate.y;
        const right = canvas.width / zoom - translate.x;
        const bottom = canvas.height / zoom - translate.y;

        const startX = Math.floor(left / grid) * grid;
        const startY = Math.floor(top / grid) * grid;

        for (let x = startX; x <= right; x += grid) {
            context.moveTo(x, top);
            context.lineTo(x, bottom);
        }

        for (let y = startY; y <= (bottom); y += grid) {
            context.moveTo(left, y);
            context.lineTo(right, y);
        }
        context.stroke();
        context.restore();
        
    }

    function drawBoundary() {
        context.save();

        context.strokeStyle = 'rgb(4, 134, 0)';
        context.lineWidth = 2/zoom;

        context.strokeRect(0, 0, boundary.w, boundary.h);

        context.restore()
    }

    function drawRectangle(element) {
        context.save();
        
        context.fillStyle = element.properties.color;   
        
        context.translate((element.x + element.w/2), (element.y + element.h/2));
        context.rotate(element.rotation * Math.PI / 180)
        
        context.roundRect(-element.w/2, -element.h/2, element.w, element.h, element.properties.radii ?? 0);
        context.fill();

        context.restore();
    }

    function drawEllipse(element) {
        context.save();

        context.fillStyle = element.properties.color;

        context.beginPath();
        context.ellipse(
            element.x + element.w/2, 
            element.y + element.h/2,
            element.w/2,
            element.h/2,
            element.rotation * Math.PI / 180,
            0, 2 * Math.PI);
        context.closePath();
        context.fill();

        context.restore();
    }


    function drawText(element) {
        context.save();
        
        const rotation = element.rotation * Math.PI/180;
        const centerX = element.x + element.w/2;
        const centerY = element.y + element.h/2;

        context.translate(centerX, centerY);
        context.rotate(rotation);
        
        context.textBaseline = "top";
        context.fillStyle = element.properties.color;
        context.font = `${element.properties.text_size}px ${element.properties.font}`;
        context.fillText(element.content, element.x - centerX, element.y - centerY);
        
        context.restore();
    }
    
    // TODO:
    function drawTextBox(element) {
        context.save();
        
        const rotation = element.rotation * Math.PI/180;
        const centerX = element.x + element.w/2;
        const centerY = element.y + element.h/2;
        
        context.translate(centerX, centerY);
        context.rotate(rotation);

        context.textBaseline = "top";
        context.fillStyle = element.properties.color;
        context.font = `${element.properties.size}px ${element.properties.font}`;
        
        const lines = [];
        
        for (const paragraph of element.properties.content.split("\n")) {
            lines.push(...wrapText(paragraph, element.w));
        }

        const textMetrics = context.measureText("M");
        const textHeight = textMetrics.fontBoundingBoxAscent + textMetrics.fontBoundingBoxDescent;

        let y = element.y - centerY;

        for (const line of lines) {
            context.fillText(line, element.x - centerX, y);

            y += textHeight + element.properties.spacing;
        }

        context.restore();
    } 

    function wrapText(text, maxWidth) {
        const words = text.split(" ");
        const lines = [];
        let line = "";
        for (const word of words) {
            const testLine = line === "" ? word : `${line} ${word}`
            
            if (context.measureText(testLine).width <= maxWidth) {
                line = testLine;
            } else {
                if (line !== "") {
                    lines.push(line);
                }
                line = word;
            }
        }

        if (line !== "") {
            lines.push(line);
        }

        return lines;
    }

    function drawImage(element) {
        context.save();
        context.globalAlpha = element.alpha;
        
        const rotation = element.rotation * Math.PI/180;
        const centerX = element.x + element.w/2;
        const centerY = element.y + element.h/2;

        context.translate(centerX, centerY);
        context.rotate(rotation);

        try {
            context.drawImage(
                element.imageElement, 
                -element.w/2, 
                -element.h/2, 
                element.w, 
                element.h);
        }
        catch (error) {
            let temp = {x: -element.w/2, y: -element.h/2, h: element.h, w: element.h, rotation: 0, properties: {color: "black"}}
            drawRectangle(temp);
        }
        context.restore();
    }

    function drawVideo(element) {
        context.save();

        const rotation = element.rotation * Math.PI / 180;
        const centerX = element.x + element.w/2;
        const centerY = element.y + element.h/2;

        context.translate(centerX, centerY);
        context.rotate(rotation);

        if (element.properties.videoElement && element.properties.videoElement.readyState >= 2) {
            context.drawImage(element.properties.videoElement,
                -element.w/2,
                -element.h/2,
                element.w,
                element.h
            );
        } else {
            let temp = {x: -element.w/2, y: -element.h/2, h: element.h, w: element.h, rotation: 0, properties: {color: "black"}}
            drawRectangle(temp);
        }
    }
        
    function objectBoundary(element) {
        context.save();

        const handleSize = 5/zoom;

        context.fillStyle = 'rgb(0, 255, 255)';
        context.strokeStyle = 'rgb(0, 255, 255)';
        context.lineWidth = 0.5/zoom;

        const x = element.x;
        const y = element.y;
        const right = x + element.w;
        const bottom = y + element.h;

        // Element corners in world coordinates.
        const corners = [
            {x, y},
            {x: right, y},
            {x: right, y: bottom},
            {x, y: bottom},
        ];

        // Rotate corners around the element center.
        const transformedCorners = corners.map(point => transformPoint(point, element));

        // Draw the element boundary.
        drawPolygon(transformedCorners)
        context.stroke();

        // Resize Handles.
        const handleCenters = corners;

        for (const center of handleCenters) {
            const handle = [
                {x: center.x - handleSize, y: center.y - handleSize},
                {x: center.x + handleSize, y: center.y - handleSize},
                {x: center.x + handleSize, y: center.y + handleSize},
                {x: center.x - handleSize, y: center.y + handleSize},
            ];

            const transformedHandle = handle.map(point => transformPoint(point, element));

            drawPolygon(transformedHandle);
            context.fill();
        }

        context.restore();
    }

    function drawPolygon(points) {
        if (points.length === 0) return;
        context.beginPath();
        context.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
            context.lineTo(points[i].x, points[i].y);
        }

        context.closePath()
    }

    // ---------------------------------
    // API
    // ---------------------------------
    let api = {
        // Canvas
        resize,

        // View State
        getZoom,
        setZoom,
        setOnZoomChange,

        getBoundary,
        setBoundary,
        setOnBoundaryChange,

        getTranslate,
        setTranslate,
        setOnTranslateChange,

        // Coordinate Conversion
        transformPoint,
        
        // Rendering
        clear,
        drawBoundary,
        drawRectangle,
        drawEllipse,
        drawGrid,
        drawText,
        drawImage,
        drawTextBox,
        drawVideo,
        objectBoundary,
    }

    return api;
}());

