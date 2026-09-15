import { buildChatHandler, buildChatNotificationHandler } from "../events/eventHandlers/chatHandler.js";
import { buildFollowHandler } from "../events/eventHandlers/followHandler.js";
import { buildPointHandler } from "../events/eventHandlers/pointHandler.js";
import { buildRaidHandler } from "../events/eventHandlers/raidHandler.js";
import { buildStreamOfflineHandler, buildStreamOnlineHandler } from "../events/eventHandlers/streamConnect.js";
import { buildSubscriptionHandler } from "../events/eventHandlers/subscribeHandler.js";

export function buildHandlers({eventDispatcher, services, db, twitch, websocket}) {
    eventDispatcher.registerHandler("stream.online", buildStreamOnlineHandler({ twitch, db, websocket}), true);

    eventDispatcher.registerHandler("stream.offline", buildStreamOfflineHandler({db, websocket}), true,);

    // Big Alerts
    eventDispatcher.registerHandler("channel.follow", buildFollowHandler({db, services, websocket}), true);
    eventDispatcher.registerHandler("channel.subscribe", buildSubscriptionHandler({db, services, websocket}), true);
    eventDispatcher.registerHandler("channel.raid", buildRaidHandler({db, services, websocket}), true)

    
    // Chat Handlers
    const chatHandler = buildChatHandler({websocket, twitch});
    chatHandler.initialize();
    eventDispatcher.registerHandler("channel.chat.message", chatHandler.messageHandler, false);
    eventDispatcher.registerHandler("channel.chat.message_delete", chatHandler.deleteHandler, false);
    eventDispatcher.registerHandler("channel.chat.clear", chatHandler.clearHandler, false);
    eventDispatcher.registerHandler("automod.message.hold", chatHandler.holdHandler, false);
    eventDispatcher.registerHandler("automod.message.update", chatHandler.updateHandler, false);
    eventDispatcher.registerHandler("channel.chat.clear_user_messages", chatHandler.clearUserHandler, false);
    eventDispatcher.registerHandler("channel.chat.notification", buildChatNotificationHandler({db, websocket}), false);

    // Channel Points
    eventDispatcher.registerHandler("channel.channel_points_custom_reward_redemption.add", buildPointHandler({websocket}), false);
}