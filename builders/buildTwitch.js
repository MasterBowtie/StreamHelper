import { buildTwitchAuthService } from "../twitch/twitchAuthService.js";
import { buildTwitchApiClient } from "../twitch/twitchApiClient.js";
import { buildTokenManager } from "../twitch/tokenManager.js";
import { buildPublicTwitchAuthService } from "../twitch/publicTwitchAuthService.js";
import { buildPrivateTwitchAuthService } from "../twitch/privateTwitchAuthService.js";
import { AUTH_CLIENT_TYPES } from "../server/constants.js"
import { config } from "dotenv";

export async function buildTwitch({ db, services }) {

    const twitchState = {
        initialized: false,
        authenticated: false,
        clientType: null,
        broadcaster: null,
        eventSub: {
            connected: false
        }
    }
    twitchState.clientType = await services.settingService.get("twitch.clientType");

    const authService = twitchState.clientType === AUTH_CLIENT_TYPES.PUBLIC ? buildPublicTwitchAuthService({services}) : buildPrivateTwitchAuthService({services});

    const twitchAuthService = buildTwitchAuthService({authService, services});

    const tokenManager = buildTokenManager({ db, twitchAuthService , services});

    const twitchApiClient = buildTwitchApiClient({ tokenManager });

    function getStatus() {
        return {...twitchState};
    }
    
    function setEventSubStatus(eventSubStatus) {
        twitchState.eventSub = eventSubStatus;
    }

    async function initialize() {
        const broadcaster = await db.twitchUserRepository.getBroadcaster();

        if (!broadcaster) {
            console.warn("No broadcaster twitchState.");
        }

        twitchState.broadcaster = {
            twitchId: broadcaster.twitch_id,
            login: broadcaster.login,
            displayName: broadcaster.display_name,
        };

        const token = await tokenManager.getValidAccessToken(broadcaster);

        if (!token.success) {
            twitchState.reason = token.reason;
            return {...twitchState};
        }

        twitchState.authenticated = true;
        twitchState.initialized = true;

        return {...twitchState};
    }

    return {
        initialize,
        getStatus,
        setEventSubStatus,
        twitchAuthService,
        twitchApiClient,
        tokenManager
    };
}