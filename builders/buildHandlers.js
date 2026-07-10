import { buildFollowHandler } from "../events/eventHandlers/followHandler.js";
import { buildStreamOfflineHandler, buildStreamOnlineHandler } from "../events/eventHandlers/streamConnect.js";

export function buildHandlers({eventDispatcher, services, db, twitch, }) {
    eventDispatcher.registerHandler("stream.online", buildStreamOnlineHandler({
        twitchApiClient: twitch.twitchApiClient,
        streamRepository: db.streamRepository}));

    eventDispatcher.registerHandler("stream.offline", buildStreamOfflineHandler({streamRepository: db.streamRepository}));

    eventDispatcher.registerHandler("channel.follow", buildFollowHandler({followerRepository: db.followerRepository, twitchUserService: services.twitchUserService}))
}