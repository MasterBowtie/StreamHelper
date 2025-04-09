MyCanvas.main = (function(graphics, users) {
    var prevTime = 0;
    var test = {x: 200, y: 200, h: 70, w: 100, r: 255, g: 150, b: 150}
    // document.body.appendChild(img);

    function update(elapsedTime) {
        // console.log(`Elapsed Time: ${elapsedTime}`)
    }

    function render(elapsedTime) {
        graphics.drawImage(test);

    }

    function animationLoop(time) {
        var elapsedTime = time - prevTime;

        update(elapsedTime);
        render(elapsedTime);

        prevTime = time;
        requestAnimationFrame(animationLoop);
    }

    console.log("Initializiong Canvas...")
    requestAnimationFrame(animationLoop);
}(MyCanvas.graphics))