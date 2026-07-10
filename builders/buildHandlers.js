import { buildFollowHandler } from "../events/eventHandlers/followHandler.js";
import { buildStreamOfflineHandler, buildStreamOnlineHandler } from "../events/eventHandlers/streamConnect.js";

export function buildHandlers({events, services, db, twitch, websocket}) {
    events.eventDispatcher.registerHandler("stream.online", buildStreamOnlineHandler({ twitch, db, websocket}));

    events.eventDispatcher.registerHandler("stream.offline", buildStreamOfflineHandler({db, websocket}));

    events.eventDispatcher.registerHandler("channel.follow", buildFollowHandler({db, services, websocket}))
}