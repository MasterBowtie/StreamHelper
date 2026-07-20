import { buildTwitchAuthService } from "../twitch/twitchAuthService.js";
import { buildTwitchApiClient } from "../twitch/twitchApiClient.js";
import { buildTokenManager } from "../twitch/tokenManager.js";
import { buildPublicTwitchAuthService } from "../twitch/publicTwitchAuthService.js";
import { buildPrivateTwitchAuthService } from "../twitch/privateTwitchAuthService.js";
import { AUTH_CLIENT_TYPES } from "../server/constants.js"
import { EVENTS } from "../websocket/events.js";

export async function buildTwitch({ db, services, websocket }) {

    const state = {
        initialized: false,
        authenticated: false,
        clientType: null,
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

    const twitchApiClient = buildTwitchApiClient({ tokenManager });

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

    async function connect() {
        if (state.authenticated) {
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
            const device = await publicTwitchAuth.startDeviceAuth();

            if (!device.success) {
                return device;
            }

            state.authentication = {
                polling: true,
                userCode: device.userCode,
                verificationUri: device.verificationUri,
                expiresAt: Date.now() + device.expiresIn * 1000
            }
            
            void publicTwitchAuth.awaitDeviceToken(device.deviceCode);

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
        if (!token) {
            state.reason = "No token";
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