import { buildWebsocketServer } from "../websocket/websocketServer.js";
import { buildNotifier } from "../websocket/notify.js";

export function buildWebsocket() {
    const websocketServer = buildWebsocketServer();

    const notifier = buildNotifier({
        websocketServer
    });

    async function initialize(server) {
        websocketServer.start(server);

        console.log("Websocket Initialized...");
    }

    return {
        initialize,
        websocketServer,
        notifier
    };
}