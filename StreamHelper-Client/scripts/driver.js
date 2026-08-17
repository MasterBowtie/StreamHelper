import { MyDraw } from "./objects.js";

MyDraw.driver = (function(state) {
    'use strict';

    let renderPending = false;

    function requestUpdate() {
        if (renderPending) return;

        renderPending = true;
        requestAnimationFrame(frame);
    }

    function frame(time) {
        renderPending = false;

        state.update(time);
        state.render(time);
    }

    const api = {
        requestUpdate
    }

    return api;

}(null));