import { buildChatHandler, buildChatNotificationHandler } from "../events/eventHandlers/chatHandler.js";
import { buildFollowHandler } from "../events/eventHandlers/followHandler.js";
import { buildRaidHandler } from "../events/eventHandlers/raidHandler.js";
import { buildStreamOfflineHandler, buildStreamOnlineHandler } from "../events/eventHandlers/streamConnect.js";
import { buildSubscriptionHandler } from "../events/eventHandlers/subscribeHandler.js";

export function buildHandlers({eventDispatcher, services, db, twitch, websocket}) {
    eventDispatcher.registerHandler("stream.online", buildStreamOnlineHandler({ twitch, db, websocket}), true);

    eventDispatcher.registerHandler("stream.offline", buildStreamOfflineHandler({db, websocket}), true,);

    eventDispatcher.registerHandler("channel.follow", buildFollowHandler({db, services, websocket}), true);

    eventDispatcher.registerHandler("channel.subscribe", buildSubscriptionHandler({db, services, websocket}), true);

    eventDispatcher.registerHandler("channel.raid", buildRaidHandler({db, services, websocket}), true)

    eventDispatcher.registerHandler("channel.chat.message", buildChatHandler({websocket}), false);

    eventDispatcher.registerHandler("channel.chat.notification", buildChatNotificationHandler({db, websocket}), false);
    
}