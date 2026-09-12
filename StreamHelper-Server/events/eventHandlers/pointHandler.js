import { EVENTS } from "../../websocket/events.js";

export function buildPointHandler({websocket}) {
    async function handler(event) {
        websocket.notifier.notify(EVENTS.TWITCH.ALERTS.POINTS, event);
    }

    return handler;
}