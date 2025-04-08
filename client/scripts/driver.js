MyCanvas.main = (function() {
    var prevTime = 0;
    

    function update(elapsedTime) {
        debug_all && console.log(`Elapsed Time: ${elapsedTime}`)
    }

    function render(elapsedTime) {

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
})