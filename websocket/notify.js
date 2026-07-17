import { createMessage } from "./protocol.js"

export function buildNotifier({websocketServer}) {

    function notify(type, payload) {
        websocketServer.broadcast(createMessage(type, payload));
    }

    return {
        notify
    };
}