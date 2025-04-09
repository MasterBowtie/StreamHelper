
/**
 * element
 * @key int     x
 * @key int     y
 * @key int     w
 * @key int     h
 * @key string   imageElement
 * @key string  name
 * @key float  r
 * @key float  g
 * @key float  b
 * 
 */

MyCanvas.graphics = (function() {
    var canvas = document.getElementById("canvas-main");
    var context = canvas.getContext("2d");
    var offscreen;
    var offContext;

    var img = document.createElement("img")
    img.src = "src/assets/bowtie_gray.png";
    img.crossOrigin = "anonymous";
    img.onload = ()=> {
        offscreen = new OffscreenCanvas(img.width, img.height);
        offContext = offscreen.getContext("2d");
        console.log(img.width, img.height);
    }

    function clear() {
        context.save();
        context.clearRect(0,0, canvas.clientWidth, canvas.height);
        context.restore();
    }

    function clearOffscreen() {
        if (!offContext) {
            return;
        }
        offContext.save();
        offContext.clearRect(0,0, offscreen.width, offscreen.height);
        offContext.restore();
    }

    function colorize(r, g, b) {
        if (!offContext) {
            return
        }
        offContext.drawImage(img, 0, 0);

        r = r/255;
        g = g/255;
        b = b/255;

        let imageData = offContext.getImageData(0, 0, img.width, img.height);
        // console.log(imageData.data);
        // console.log(b);

        for (let i = 0; i < imageData.data.length; i+= 4) {
            imageData.data[i+0] *= r; //red
            imageData.data[i+1] *= g; //green
            imageData.data[i+2] *= b; //blue
        }

        offContext.putImageData(imageData, 0, 0);

        return offscreen;
    }

    function drawImage(element) {
        // console.log("Draw image");
        // let imageElement = document.createElement("img");
        // imageElement.src = element.image;
        // imageElement.style.filter = "hue-rotate(90deg)"
        let newImage = colorize(element.r, element.g, element.b);

        if (!newImage) {
            return;
        }
        
        context.drawImage(newImage, element.x, element.y, img.width * .12, img.height * .12);
    }

    let api = {
        clear: clear,
        drawImage: drawImage
    }
    return api;
}())