import { EVENTS } from "../../websocket/events.js";

function buildBitHandler({websocket}) {

    async function handler(event) {
        websocket.notifier.notify(EVENTS.TWITCH.ALERTS.BITS, event)
    }
}