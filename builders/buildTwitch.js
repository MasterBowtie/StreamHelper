import { buildTwitchAuthService } from "../twitch/twitchAuthService.js";
import { buildTwitchApiClient } from "../twitch/twitchApiClient.js";
import { buildTokenManager } from "../twitch/tokenManager.js";

export function buildTwitch({
    twitchUserRepository
}) {
    const twitchAuthService = buildTwitchAuthService({
        twitchUserRepository
    });

    const tokenManager = buildTokenManager({
        twitchUserRepository, twitchAuthService
    });

    const twitchApiClient = buildTwitchApiClient({
        tokenManager
    });

    return {
        twitchAuthService,
        twitchApiClient,
        tokenManager
    };
}