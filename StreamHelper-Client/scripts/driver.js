import { MyElements, MyGraphics } from "./objects.js";

MyGraphics.main = (function(graphics, state) {
    'use strict';

    var prevTime = 0;

    function update(elapsedTime) {
        state.update(elapsedTime, graphics);
    }
    
    function render(elapsedTime) {
        graphics.clear();
        
        state.render(elapsedTime, graphics);
    }

    function animationLoop(time) {
        var elapsedTime = time - prevTime;

        update(elapsedTime);
        render(elapsedTime);

        prevTime = time;
        requestAnimationFrame(animationLoop);
    }

    console.log("Initializing Canvas...")
    requestAnimationFrame(animationLoop);

}(MyGraphics.graphics, MyElements.main));