import { createMessage } from "./protocol.js"

export function buildNotifier({webSocketServer}) {

    function publish(type, payload) {
        webSocketServer.broadcast(createMessage(type, payload));
    }

    return {
        publish
    };
}