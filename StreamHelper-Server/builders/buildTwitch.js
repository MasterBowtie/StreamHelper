import { buildTwitchAuthService } from "../twitch/twitchAuthService.js";
import { buildTwitchApiClient } from "../twitch/twitchApiClient.js";
import { buildTokenManager } from "../twitch/tokenManager.js";
import { buildPublicTwitchAuthService } from "../twitch/publicTwitchAuthService.js";
import { buildPrivateTwitchAuthService } from "../twitch/privateTwitchAuthService.js";
import { AUTH_CLIENT_TYPES } from "../server/constants.js"
import { EVENTS } from "../websocket/events.js";

export async function buildTwitch({ db, services, websocket }) {
    const clientType = await services.settingService.get("twitch.clientType");

    const state = {
        initialized: false,
        authenticated: false,
        clientType: clientType.data,
        broadcaster: null,
        eventSub: {
            connected: false
        },
        authentication: {
            polling: false
        }
    }

    const publicTwitchAuth = buildPublicTwitchAuthService({services});

    const privateTwitchAuth = buildPrivateTwitchAuthService({services});

    const twitchAuthService = buildTwitchAuthService({privateTwitchAuth, publicTwitchAuth, services});

    const tokenManager = buildTokenManager({ db, twitchAuthService , services});

    const twitchApiClient = buildTwitchApiClient({ tokenManager, services });

    async function disconnect(events) {
        await events.eventSubService.stop();
        await db.twitchUserRepository.updateToken({accessToken: null, refreshToken: null, expiresIn: 0});

        state.authenticated = false;
        state.broadcaster = null;
        state.eventSub.connected = false;
        state.clientType = await services.settingService.get("twitch.clientType");

        websocket.notifier.notify(EVENTS.APP.TWITCH_STATUS_CHANGE, getStatus())

        return {...state};
    }

    function getStatus() {
        return {...state};
    }

    function setEventSubStatus(eventStatus) {
        state.eventSub = eventStatus;
    }

    async function connect(events) {
        if (state.authenticated && state.eventSub.connected) {
            return {
                success: true,
                message: "Already authenticated."
            };
        } else if (state.authentication.polling) {
            return {
                success: false,
                message: "Authentication already in progress"
            }
        }

        if (state.clientType === "public") {
            void runPolling(events);

            state.authentication.polling = true;

            return {
                success: true,
                mode: "public"
            }
        } else if (state.clientType === "private") {
            const url = await privateTwitchAuth.getLoginUrl();

            state.authentication = {
                polling: false
            };

            return {
                success: true,
                mode: "private",
                authorizationUrl: url
            }
        }
        return {success: false, message: "It Broke!"}
    }

    async function runPolling(events) {
        const data = await publicTwitchAuth.startDeviceAuth();

        
        if (!data.success) {
            websocket.notifier.notify("error.twitch.connect", {payload: data});
            return;
        }
        websocket.notifier.notify(EVENTS.APP.AUTH_REQUIRED, data);

        const token = await publicTwitchAuth.awaitDeviceToken(data.deviceCode, 1000);

        if (!token.success) {
            websocket.notifier.notify(EVENTS.ERRORS.CLIENT_INVALID);
        }

        state.authentication.polling = 'false';
        websocket.notifier.notify("auth.token", token);

        const dbStatus = await db.twitchUserRepository.updateToken(token);

        console.log("Polling: ", dbStatus);
    }

    async function initialize() {
        const broadcaster = await db.twitchUserRepository.getBroadcaster();

        if (!broadcaster) {
            console.warn("No broadcaster state.");
        }

        state.broadcaster = {
            twitchId: broadcaster.twitch_id,
            login: broadcaster.login,
            displayName: broadcaster.display_name,
        };

        const token = await tokenManager.getValidAccessToken();
        if (!token.success) {
            state.message = "No token";
            console.warn("Twitch Init", token.message);
            return {...state};
        }

        state.authenticated = true;
        state.initialized = true;

        websocket.notifier.notify(EVENTS.APP.CONNECTED);
        console.log("Twitch Initialized...");
        return {...state};
    }

    return {
        initialize,
        getStatus,
        setEventSubStatus,
        connect,
        disconnect,
        runPolling,
        publicTwitchAuth,
        privateTwitchAuth,
        twitchAuthService,
        twitchApiClient,
        tokenManager
    };
}