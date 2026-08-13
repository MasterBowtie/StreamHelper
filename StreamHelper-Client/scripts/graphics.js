import { MyElements, MyGraphics } from "./objects.js";

MyGraphics.graphics = (function(matrix) {
    'use strict';
    var canvas = document.getElementById('canvas-main');
    var context = canvas.getContext('2d');
    var zoom = 1;
    var grid = 1;
    var printing = false;
    var label = {h: 600, w: 600}
    var translate = {x: 100, y: 100}
    var canvasOrig = { width: canvas.width, height: canvas.height};

    function clear() {
        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.restore();
        context.setTransform(zoom,0,0,zoom, translate.x*zoom, translate.y*zoom);
    }

    function startPrint() {
        canvas.width = label.w;
        canvas.height = label.h;
        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.restore();
        context.setTransform(1, 0, 0, 1, 0, 0);
        printing = true;
    }

    function endPrint() {
        let data = canvas.toDataURL("image/jpeg", 1.0);
        canvas.width = canvasOrig.width;
        canvas.height = canvasOrig.height;
        printing = false;
        return data;
    }

    function labelBoundry() {
        // console.log("Boundry:", context.width, context.height);
        context.strokeStyle = "rgb(4, 134, 0)";
        context.lineWidth = 2/zoom;
        

        //TODO Matricies these and then transform each
        let path = [{x: 0, y: 0}, 
            {x: label.w, y: 0}, 
            {x: label.w, y: label.h}, 
            {x: 0, y: label.h}]

        
        context.beginPath();
        context.moveTo(path[0].x, path[0].y);
        for (let i = 1; i< path.length; i++) {
            context.lineTo(path[i].x, path[i].y);
        }
        context.closePath();
        context.stroke(); 
    }

    function drawRectangle(element) {
        context.save();
        context.fillStyle = element.color;   

        context.translate((element.x + element.w/2), (element.y + element.h/2));
        context.rotate(element.rotation * Math.PI / 180)
        
        context.beginPath();
        if (!element.radii) {
            element.radii = 0;
        }
        context.roundRect(-element.w/2, -element.h/2, element.w, element.h, element.radii);
        context.closePath();
        context.fill();

        context.restore();
    }

    function drawEllipse(element) {
        context.save();

        context.fillStyle = element.color;

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

    function drawBoundry(element) {
        context.fillStyle = "rgb(0, 255, 255)"

        //TODO Matricies these and then transform each
        let path = [{x: element.x, y: element.y}, 
            {x: element.x+element.w, y: element.y}, 
            {x: element.x+element.w, y: element.y+element.h}, 
            {x: element.x, y:element.y + element.h}]

        let pathCopy = [];
        for (let i = 0; i < path.length; i++) {
            pathCopy[i] = path[i];
            path[i] = transformPoint(path[i], element, false);
        }
        
        // Prevent sizing box from shrinking
        let s = 5/zoom;
        let corners = [
            [{x:element.x-s, y:element.y - s}, {x:element.x+s, y:element.y - s}, {x:element.x+s, y:element.y + s}, {x:element.x-s, y:element.y + s}],
            [{x:element.x + element.w-s, y:element.y - s}, {x:element.x + element.w+s, y:element.y - s}, {x:element.x + element.w+s, y:element.y + s}, {x:element.x + element.w-s, y:element.y + s}],
            [{x:element.x + element.w-s, y:element.y + element.h-s}, {x:element.x + element.w+s, y:element.y + element.h-s}, {x:element.x + element.w+s, y:element.y + element.h+s}, {x:element.x + element.w-s, y:element.y + element.h+s}],
            [{x:element.x - s, y:element.y + element.h-s}, {x:element.x + s, y:element.y + element.h-s}, {x:element.x + s, y:element.y + element.h+s}, {x:element.x - s, y:element.y + element.h+s}]
        ]
        let copy = [];
        
        for (let i = 0; i < corners.length; i ++ ) {
            copy[i] = [];
            for (let j = 0; j < corners[i].length; j ++) {
                copy[i][j] = corners[i][j];
                corners[i][j] = transformPoint(corners[i][j], element, false);
            }
        }
            
        // Over All Boundry
        context.strokeStyle = "rgb(0, 255, 255)"
        context.lineWidth = .5/zoom;
        context.beginPath();
        context.moveTo(path[0].x, path[0].y);
        for (let i = 1; i< path.length; i++) {
            context.lineTo(path[i].x, path[i].y);
        }
        context.closePath();
        context.stroke();
        
        for (let i = 0; i < corners.length; i++) {
            context.beginPath();
            context.moveTo(corners[i][0].x, corners[i][0].y);
            for (let j = 1; j < corners[i].length; j++) {
                context.lineTo(corners[i][j].x, corners[i][j].y);
            }
            context.closePath();
            context.fill();
        }

        // Visual for the rotaional detection
        // let rotateCorners = [
        //     [{x:element.x-3*s, y:element.y - 3 * s}, {x:element.x - s, y:element.y - 3 * s}, {x:element.x - s, y:element.y - s}, {x:element.x - 3 * s, y:element.y - s}],
        //     [{x:element.x + element.w + s, y:element.y - 3 * s}, {x:element.x + element.w+3*s, y:element.y - 3 * s}, {x:element.x + element.w+3*s, y:element.y - s}, {x:element.x + element.w+s, y:element.y - s}],
        //     [{x:element.x + element.w+s, y:element.y + element.h+s}, {x:element.x + element.w+3*s, y:element.y + element.h+s}, {x:element.x + element.w+3*s, y:element.y + element.h+3*s}, {x:element.x + element.w+s, y:element.y + element.h+3*s}],
        //     [{x:element.x-3*s, y:element.y + element.h+s}, {x:element.x - s, y:element.y + element.h+s}, {x:element.x - s, y:element.y + element.h+3*s}, {x:element.x -3*s, y:element.y + element.h+3*s}]
        // ]
        // for (let i = 0; i < rotateCorners.length; i++) {
        //     context.beginPath();
        //     context.moveTo(rotateCorners[i][0].x, rotateCorners[i][0].y);
        //     for (let j = 1; j < rotateCorners[i].length; j++) {
        //         context.lineTo(rotateCorners[i][j].x, rotateCorners[i][j].y);
        //     }
        //     context.closePath();
        //     context.fill();
        // }

        // //Development Shape
        // context.fillStyle = "rgb(255, 0, 0)";
        // context.strokeStyle = "rgb(255, 0, 0)";
        // context.lineWidth = .5/zoom;
        // context.beginPath();
        // context.moveTo(pathCopy[0].x, pathCopy[0].y);
        // for (let i = 1; i< pathCopy.length; i++) {
        //     context.lineTo(pathCopy[i].x, pathCopy[i].y);
        // }
        // context.closePath();
        // context.stroke();
        
        // for (let i = 0; i < copy.length; i++) {
        //     context.beginPath();
        //     context.moveTo(copy[i][0].x, copy[i][0].y);
        //     for (let j = 1; j < copy[i].length; j++) {
        //         context.lineTo(copy[i][j].x, copy[i][j].y);
        //     }
        //     context.closePath();
        //     context.fill();
        // }
    }

    // mouseState = {x, y, leftIsDown}
    // element = {x, y, h, w, rotation, color, type } 
    function drawMouse(element, mouseState) {
        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);
        mouseState = transformPoint(mouseState, element, true);
        
        let path = [{x: element.x, y: element.y}, 
            {x: element.x+element.w, y: element.y}, 
            {x: element.x+element.w, y: element.y+element.h}, 
            {x: element.x, y:element.y + element.h}]
            
            let s = 5/zoom;
            let corners = [
                [{x:element.x-s, y:element.y - s}, {x:element.x+s, y:element.y - s}, {x:element.x+s, y:element.y + s}, {x:element.x-s, y:element.y + s}],
                [{x:element.x + element.w-s, y:element.y - s}, {x:element.x + element.w+s, y:element.y - s}, {x:element.x + element.w+s, y:element.y + s}, {x:element.x + element.w-s, y:element.y + s}],
                [{x:element.x + element.w-s, y:element.y + element.h-s}, {x:element.x + element.w+s, y:element.y + element.h-s}, {x:element.x + element.w+s, y:element.y + element.h+s}, {x:element.x + element.w-s, y:element.y + element.h+s}],
                [{x:element.x - s, y:element.y + element.h-s}, {x:element.x + s, y:element.y + element.h-s}, {x:element.x + s, y:element.y + element.h+s}, {x:element.x - s, y:element.y + element.h+s}]
            ]
            
            
            // Over All Boundry
            context.fillStyle = "rgb(0, 0, 255)";
            context.strokeStyle = "rgb(0, 0, 255)";
            context.lineWidth = .5;
            context.beginPath();
            context.moveTo(path[0].x, path[0].y);
            for (let i = 1; i< path.length; i++) {
                context.lineTo(path[i].x, path[i].y);
            }
            context.closePath();
            context.stroke();
            
            for (let i = 0; i < corners.length; i++) {
                context.beginPath();
                context.moveTo(corners[i][0].x, corners[i][0].y);
                for (let j = 1; j < corners[i].length; j++) {
                    context.lineTo(corners[i][j].x, corners[i][j].y);
                }
                context.closePath();
                context.fill();
            }
            drawRectangle({x: mouseState.x-5/zoom, y: mouseState.y-5/zoom, h: 10/zoom, w: 10/zoom, rotation: 0, color: "rgb(0, 150, 0)"});
            context.restore();
    }

    function detectCursor(element, mouseState) {
        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);
        mouseState = transformPoint(mouseState, element, true);
        
        let path = [{x: element.x, y: element.y}, 
            {x: element.x+element.w, y: element.y}, 
            {x: element.x+element.w, y: element.y+element.h}, 
            {x: element.x, y:element.y + element.h}]
            
            let s = 5/zoom;
            let corners = [
                [{x:element.x-s, y:element.y - s}, {x:element.x+s, y:element.y - s}, {x:element.x+s, y:element.y + s}, {x:element.x-s, y:element.y + s}],
                [{x:element.x + element.w-s, y:element.y - s}, {x:element.x + element.w+s, y:element.y - s}, {x:element.x + element.w+s, y:element.y + s}, {x:element.x + element.w-s, y:element.y + s}],
                [{x:element.x + element.w-s, y:element.y + element.h-s}, {x:element.x + element.w+s, y:element.y + element.h-s}, {x:element.x + element.w+s, y:element.y + element.h+s}, {x:element.x + element.w-s, y:element.y + element.h+s}],
                [{x:element.x - s, y:element.y + element.h-s}, {x:element.x + s, y:element.y + element.h-s}, {x:element.x + s, y:element.y + element.h+s}, {x:element.x - s, y:element.y + element.h+s}]
            ]
            
            // Over All Boundry
            context.fillStyle = "rgb(0, 0, 255)";
            context.strokeStyle = "rgb(0, 0, 255)";
            context.lineWidth = .5;
            context.beginPath();
            context.moveTo(path[0].x, path[0].y);
            for (let i = 1; i< path.length; i++) {
                context.lineTo(path[i].x, path[i].y);
            }
            context.closePath();
            
            // Change Cursor to move
            if (context.isPointInPath(mouseState.x, mouseState.y)) {
                canvas.style.cursor = "all-scroll";  
            } else {
                canvas.style.cursor = "auto";
            }
            
            for (let i = 0; i < corners.length; i++) {
                context.beginPath();
                context.moveTo(corners[i][0].x, corners[i][0].y);
                for (let j = 1; j < corners[i].length; j++) {
                    context.lineTo(corners[i][j].x, corners[i][j].y);
                }
                context.closePath();
                if (i === 0 && context.isPointInPath(mouseState.x, mouseState.y)) {
                    canvas.style.cursor = "nw-resize";
                } else if (i === 1 && context.isPointInPath(mouseState.x, mouseState.y)) {
                    canvas.style.cursor = "ne-resize";
                }  else if (i === 2 && context.isPointInPath(mouseState.x, mouseState.y)) {
                    canvas.style.cursor = "se-resize";
                }   else if (i === 3 && context.isPointInPath(mouseState.x, mouseState.y)) {
                    canvas.style.cursor = "sw-resize";
                }
            }
            let rotateCorners = [
                [{x:element.x-3*s, y:element.y - 3 * s}, {x:element.x - s, y:element.y - 3 * s}, {x:element.x - s, y:element.y - s}, {x:element.x - 3 * s, y:element.y - s}],
                [{x:element.x + element.w + s, y:element.y - 3 * s}, {x:element.x + element.w+3*s, y:element.y - 3 * s}, {x:element.x + element.w+3*s, y:element.y - s}, {x:element.x + element.w+s, y:element.y - s}],
                [{x:element.x + element.w+s, y:element.y + element.h+s}, {x:element.x + element.w+3*s, y:element.y + element.h+s}, {x:element.x + element.w+3*s, y:element.y + element.h+3*s}, {x:element.x + element.w+s, y:element.y + element.h+3*s}],
                [{x:element.x-3*s, y:element.y + element.h+s}, {x:element.x - s, y:element.y + element.h+s}, {x:element.x - s, y:element.y + element.h+3*s}, {x:element.x -3*s, y:element.y + element.h+3*s}]
            ]
            
            for (let i = 0; i < rotateCorners.length; i++) {
                context.beginPath();
                context.moveTo(rotateCorners[i][0].x, rotateCorners[i][0].y);
                for (let j = 1; j < rotateCorners[i].length; j++) {
                    context.lineTo(rotateCorners[i][j].x, rotateCorners[i][j].y);
                }
                context.closePath();
                if(context.isPointInPath(mouseState.x, mouseState.y)) {
                    canvas.style.cursor = "alias";
                }
            }
            
            context.restore();
        }
        
        function drawText(element) {
            context.save();
            
            let rotation = element.rotation * Math.PI/180;
            let transform = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
            if (!printing) {
                transform = [[zoom, 0, 0], [0, zoom, 0], [0, 0, 1]];
                transform = matrix.dotProduct(transform, [[1, 0, translate.x], [0, 1, translate.y], [0, 0, 1]])
            }
            transform = matrix.dotProduct(transform, [[1,0,element.x + element.w/2],[0,1,element.y + element.h/2],[0,0,1]]); 
            transform = matrix.dotProduct(transform, [[Math.cos(rotation), -Math.sin(rotation), 0],[Math.sin(rotation), Math.cos(rotation), 0], [0, 0, 1]])
            transform = matrix.dotProduct(transform, [[1, 0, -element.x - element.w/2],[0, 1, -element.y - element.h/2],[0, 0, 1]])
            
            context.setTransform(transform[0][0], transform[1][0], transform[0][1], transform[1][1], transform[0][2], transform[1][2]);
            
        context.textBaseline = "top";
        context.fillStyle = element.color;
        context.font = element.size + "px " + element.font;
        context.fillText(element.content, element.x, element.y);
        
        context.restore();
    }
    
    function drawImage(element) {
        context.save();
        context.globalAlpha = element.alpha;
        
        let rotation = element.rotation * Math.PI/180;
        let transform = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
        if (!printing) {
            transform = [[zoom, 0, 0], [0, zoom, 0], [0, 0, 1]];
            transform = matrix.dotProduct(transform, [[1, 0, translate.x], [0, 1, translate.y], [0, 0, 1]])
        }
        transform = matrix.dotProduct(transform, [[1,0,element.x + element.w/2],[0,1,element.y + element.h/2],[0,0,1]]); 
        transform = matrix.dotProduct(transform, [[Math.cos(rotation), -Math.sin(rotation), 0],[Math.sin(rotation), Math.cos(rotation), 0], [0, 0, 1]])
        transform = matrix.dotProduct(transform, [[1, 0, -element.x - element.w/2],[0, 1, -element.y - element.h/2],[0, 0, 1]])
        
        context.setTransform(transform[0][0], transform[1][0], transform[0][1], transform[1][1], transform[0][2], transform[1][2]);
        
        try {
            context.drawImage(element.imageElement, element.x, element.y, element.w, element.h);
        }
        catch (error) {
            let temp = {x: element.x, y: element.y, h: element.h, w: element.h, color: "black"}
            drawRectangle(temp);
        }
        context.restore();
    }
    
    function drawTextBox(element) {
        context.save();
        
        let rotation = element.rotation * Math.PI/180;
        let transform = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
        if (!printing) {
            transform = [[zoom, 0, 0], [0, zoom, 0], [0, 0, 1]];
            transform = matrix.dotProduct(transform, [[1, 0, translate.x], [0, 1, translate.y], [0, 0, 1]])
        }
        transform = matrix.dotProduct(transform, [[1,0,element.x + element.w/2],[0,1,element.y + element.h/2],[0,0,1]]); 
        transform = matrix.dotProduct(transform, [[Math.cos(rotation), -Math.sin(rotation), 0],[Math.sin(rotation), Math.cos(rotation), 0], [0, 0, 1]])
        transform = matrix.dotProduct(transform, [[1, 0, -element.x - element.w/2],[0, 1, -element.y - element.h/2],[0, 0, 1]])

        context.setTransform(transform[0][0], transform[1][0], transform[0][1], transform[1][1], transform[0][2], transform[1][2]);

        context.textBaseline = "top";
        context.fillStyle = element.color;
        context.font = element.size + "px " + element.font;
        let lines = [];
        let tempLine = "";
        var words = element.content.split(" ");
        let i = 0;
        while (i < words.length) {
            if (words[i].includes("\n")) {
                let word1 = words[i].split("\n")[0];
                words[i] = words[i].replace(word1 + "\n", "");
                if (tempLine === "") {
                    lines.push(word1);
                } else if (context.measureText(tempLine + " " + word1).width < element.w) {
                    tempLine = tempLine + " " + word1;
                    lines.push(tempLine);
                } else {
                    lines.push(tempLine);
                    lines.push(word1);
                }
                tempLine = "";
                continue;
            }
            if (tempLine === "") {
                tempLine = words[i];
            } else if (context.measureText(tempLine + " " + words[i]).width < element.w) {
                tempLine = tempLine + " " + words[i];
                // console.log(tempLine);
            }  else {
                lines.push(tempLine);
                tempLine = words[i];
            }
            i++;
        }
        lines.push(tempLine);
        let y = element.y;
        let textHeight = context.measureText(element.content).fontBoundingBoxDescent + context.measureText(element.content).fontBoundingBoxAscent;
        for (let i = 0; i < lines.length; i++) {
            context.fillText(lines[i], element.x, y);
            y += textHeight + element.spacing;
        }
        context.restore();
    }

    // point = {x: int, y: int}
    function transformPoint(point, element, inverse) {

        let rotation = element.rotation * Math.PI/180;
        let result = [[point.x],[point.y],[1]];
        let transform = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
        if (inverse === true) {
            transform = matrix.dotProduct(transform, [[1, 0, element.x + element.w/2],[0, 1, element.y + element.h/2],[0, 0, 1]]); 
            transform = matrix.dotProduct(transform, [[Math.cos(-rotation), -Math.sin(-rotation), 0],[Math.sin(-rotation), Math.cos(-rotation), 0], [0, 0, 1]]);
            transform = matrix.dotProduct(transform, [[1,0,-element.x - element.w/2],[0,1, -element.y - element.h/2],[0,0,1]]);
            // transform = matrix.dotProduct(transform, [[1, 0, translate.x], [0, 1, translate.y], [0, 0, 1]])
        } else {
            transform = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
            transform = matrix.dotProduct(transform, [[1,0,element.x + element.w/2],[0,1,element.y + element.h/2],[0,0,1]]); 
            transform = matrix.dotProduct(transform, [[Math.cos(rotation), -Math.sin(rotation), 0],[Math.sin(rotation), Math.cos(rotation), 0], [0, 0, 1]])
            transform = matrix.dotProduct(transform, [[1, 0, -element.x - element.w/2],[0, 1, -element.y - element.h/2],[0, 0, 1]])
        }
        result = matrix.dotProduct(transform, [[point.x],[point.y],[1]]);
        return {x: result[0][0], y: result[1][0]};
    } 

    function drawGrid() {
        if (grid !== 1) {
            context.save();
            // context.setTransform(zoom, 0, 0, zoom, 0, 0);
            context.lineWidth = .1;
            context.strokeStyle = 'rgb(0, 0, 0)';
            context.beginPath();
            for (let y = -200; y <= (2400)/(grid); y++) {
                context.moveTo(-200, y * grid);
                context.lineTo((2400), y * grid);
            }
            for (let x = -200; x <= (2400)/(grid); x++) {
                context.moveTo(x * grid, -200);
                context.lineTo(x * grid, (2400));
            }
            context.stroke();
            context.restore();
        }
    }

    function printLabel(elements) {
        console.log(elements);
        startPrint();
        for (let i in elements) {
            if (elements[i].type === "box") {
                drawRectangle(elements[i]);
            }
            if (elements[i].type === "text") {
                drawText(elements[i]);
            }
            if (elements[i].type === "image" || elements[i].type === "qR_Code" || elements[i].type === "barcode") {
                drawImage(elements[i]);
            }
            if (elements[i].type === "textBox") {
                drawTextBox(elements[i])
            }
        }
        return endPrint();
    }

    function resize() {
        canvas = document.getElementById('canvas-main');
        context = canvas.getContext('2d');
        
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }

    let api = {
        clear,
        drawRectangle,
        drawEllipse,
        drawText,
        drawBoundry,
        detectCursor,
        drawImage,
        drawTextBox,
        transformPoint,
        drawGrid,
        printLabel,
        labelBoundry,
        drawMouse,
        setZoom(newZoom) { zoom = Number(newZoom)},
        get getZoom() { return zoom },
        setGrid(newGrid) {grid = Number(newGrid)},
        get getGrid() { return grid },
        get getLabel() {return label},
        get getTranslate() {return translate},
        resize,

    }

    return api;
}(MyGraphics.matrix));

