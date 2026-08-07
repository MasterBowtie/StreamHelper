import { buildTwitchAuthService } from "../twitch/twitchAuthService.js";
import { buildTwitchApiClient } from "../twitch/twitchApiClient.js";
import { buildTokenManager } from "../twitch/tokenManager.js";
import { buildPublicTwitchAuthService } from "../twitch/publicTwitchAuthService.js";
import { buildPrivateTwitchAuthService } from "../twitch/privateTwitchAuthService.js";
import { AUTH_CLIENT_TYPES } from "../server/constants.js"
import { EVENTS } from "../websocket/events.js";

export async function buildTwitch({ db, services, websocket }) {
    const clientType = await services.settingService.get("clientType", "twitch");

    const state = {
        initialized: false,
        authenticated: false,
        clientType: clientType.data,
        broadcaster: null,
        tokenExpires: null,
        authentication: {
            polling: false
        }
    }

    const publicTwitchAuth = buildPublicTwitchAuthService({services});

    const privateTwitchAuth = buildPrivateTwitchAuthService({services});

    const twitchAuthService = buildTwitchAuthService({db, privateTwitchAuth, publicTwitchAuth, services});

    const tokenManager = buildTokenManager({ db, twitchAuthService , services});

    const twitchApiClient = buildTwitchApiClient({ tokenManager, services });

    async function disconnect(events) {
        await events.disconnect();
        await db.twitchUserRepository.updateToken({accessToken: null, refreshToken: null, expiresIn: 0});

        state.authenticated = false;
        state.authentication.polling = false;
        state.broadcaster = null;
        let clientType = await services.settingService.get("clientType", "twitch");
        state.clientType = clientType.data;

        websocket.notifier.notify(EVENTS.TWITCH.STATUS.STATUS_CHANGE, getStatus())

        return {...state};
    }

    function getStatus() {
        return {...state};
    }

    async function connect(events) {
        if (state.authenticated && events.getStatus().connected) {
            console.warn("Twitch: Already authenticated");
            return {
                success: true,
                message: "Already authenticated.",
                data: {
                    mode: state.clientType,
                }
            };
        } else if (state.authentication.polling) {
            console.warn("Twitch: Authentication already in progress");
            return {
                success: true,
                message: "Authentication already in progress",
                data: {
                    ...state.authentication,
                }
            }
        }

        if (state.clientType === "public") {
            const result = await publicTwitchAuth.startDeviceAuth();
        
            if (!result.success) {
                websocket.notifier.notify(EVENTS.ERRORS.TWITCH_CONNECT, {payload: result.data});
                return;
            }
            websocket.notifier.notify(EVENTS.TWITCH.STATUS.AUTH_REQUIRED, result.data);

            state.authentication = {polling: true, ...result.data}

            // console.log("BUILD TWITCH", result.data);
            void runPolling(events, result.data.deviceCode, result.data.interval, result.data.expiresIn);

            return result;
        } else if (state.clientType === "private") {
            const url = await privateTwitchAuth.getLoginUrl();

            state.authentication = {
                polling: false
            };

            return {
                success: true,
                data: {
                    mode: "private",
                    url
                }
            }
        }
        return {success: false, message: "It Broke!"}
    }

    async function runPolling(events, deviceCode, interval, expiresIn) {
        const token = await publicTwitchAuth.awaitDeviceToken(deviceCode, interval, expiresIn);

        if (!token.success) {
            state.authentication = {polling: 'false'};
            websocket.notifier.notify(EVENTS.ERRORS.AUTH, {message: token.message});
            return;
        }

        state.authentication = {polling: 'false'};

        const dbStatus = await db.twitchUserRepository.updateToken(token.data);

        await initialize();
        await events.initialize();
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
            tokenExpires: broadcaster.expires_at,
        };

        const token = await tokenManager.getValidAccessToken();
        if (!token.success) {
            state.message = "No token";
            console.warn(token.message);
            return {...state};
        }

        state.authenticated = true;
        state.initialized = true;

        websocket.notifier.notify(EVENTS.TWITCH.STATUS.CONNECT);
        console.log("Twitch Initialized...");
        return {...state};
    }

    return {
        initialize,
        getStatus,
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