import { buildWebsocketServer } from "../websocket/websocketServer.js";
import { buildNotifier } from "../websocket/notify.js";

export function buildWebsocket() {
    const webSocketServer = buildWebsocketServer();

    const notifier = buildNotifier({
        webSocketServer
    });

    return {
        webSocketServer,
        notifier
    };
}