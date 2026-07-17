import { buildTwitchAuthService } from "../twitch/twitchAuthService.js";
import { buildTwitchApiClient } from "../twitch/twitchApiClient.js";
import { buildTokenManager } from "../twitch/tokenManager.js";
import { buildPublicTwitchAuthService } from "../twitch/publicTwitchAuthService.js";
import { buildPrivateTwitchAuthService } from "../twitch/privateTwitchAuthService.js";
import { AUTH_CLIENT_TYPES } from "../server/constants.js"

export async function buildTwitch({ db, services }) {
    const clientType = await services.settingService.get("twitch.clientType");

    const authService = clientType === AUTH_CLIENT_TYPES.PUBLIC ? buildPublicTwitchAuthService({services}) : buildPrivateTwitchAuthService({services});

    const twitchAuthService = buildTwitchAuthService({authService, services});

    const tokenManager = buildTokenManager({ db, twitchAuthService , services});

    const twitchApiClient = buildTwitchApiClient({ tokenManager });

    async function initialize() {
        const broadcaster = await db.twitchUserRepository.getBroadcaster();

        if (!broadcaster) {
            console.warn("No broadcaster configured.");
            return {
                initialized: false,
                reason: "NO_BROADCASTER",
                broadcaster: null  
            };
        }

        const token = await tokenManager.getValidAccessToken(broadcaster);

        if (!token.success) {
            return {
                initialized: false,
                reason: token.reason,
                broadcaster
            }
        }

        return {
            initialized: true,
            broadcaster
        };
    }

    return {
        initialize,
        twitchAuthService,
        twitchApiClient,
        tokenManager
    };
}