import { buildTwitchAuthService } from "../twitch/twitchAuthService.js";
import { buildTwitchApiClient } from "../twitch/twitchApiClient.js";
import { buildTokenManager } from "../twitch/tokenManager.js";

export function buildTwitch({ db }) {
    const twitchAuthService = buildTwitchAuthService();

    const tokenManager = buildTokenManager({ db, twitchAuthService });

    const twitchApiClient = buildTwitchApiClient({ tokenManager });

    return {
        twitchAuthService,
        twitchApiClient,
        tokenManager
    };
}