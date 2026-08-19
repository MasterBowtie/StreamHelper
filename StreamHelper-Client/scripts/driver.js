import { MyDraw } from "./objects.js";

MyDraw.driver = (function(state, logic) {
    'use strict';

    let renderPending = false;

    function requestUpdate() {
        if (renderPending) return;

        renderPending = true;
        requestAnimationFrame(frame);
    }

    function frame(time) {
        renderPending = false;

        logic.update(time);
        state.render(time);
    }

    const api = {
        requestUpdate
    }

    return api;

}(null, null));