import { EVENTS } from "../../websocket/events.js";

export function buildAdHandler ({websocket}) {
    var lastAd;
    var adDuration;

    async function handler(event) {
        if (event.started_at == undefined || event.duration == undefined) {
            console.error("Ad Handler: There seems to have been a error?", event);
            return;
        }
        lastAd = new Date(event.started_at);
        adDuration = event.duration_seconds;

        websocket.notifier.notify(EVENTS.TWITCH.ALERTS.ADS, event);
    }

    return handler;
}