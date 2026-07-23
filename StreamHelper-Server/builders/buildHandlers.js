import { buildFollowHandler } from "../events/eventHandlers/followHandler.js";
import { buildStreamOfflineHandler, buildStreamOnlineHandler } from "../events/eventHandlers/streamConnect.js";

export function buildHandlers({eventDispatcher, services, db, twitch, websocket}) {
    eventDispatcher.registerHandler("stream.online", buildStreamOnlineHandler({ twitch, db, websocket}));

    eventDispatcher.registerHandler("stream.offline", buildStreamOfflineHandler({db, websocket}));

    eventDispatcher.registerHandler("channel.follow", buildFollowHandler({db, services, websocket}));

    // TODO: Add subscriptions, chat messages
}