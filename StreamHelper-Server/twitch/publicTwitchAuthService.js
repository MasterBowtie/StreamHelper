import { twitchConfig } from "./twitchConfig.js";
import { sleep } from "../server/sleep.js";

export function buildPublicTwitchAuthService({db, services}) {
    async function startDeviceAuth() {
        const clientId = await services.settingService.get("clientId", "twitch");

        if (!clientId.success) {
            return clientId;
        }

        const response = await fetch(twitchConfig.oauth.authUrl,
            {
                method: "POST",
                headers: {
                    "Content-Type": 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    client_id: clientId.data,
                    scopes: twitchConfig.scopes.join(" ")
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: data.message,
            };
        }

        return {
            success: true,
            data: {
                mode: "public",
                deviceCode: data.device_code,
                userCode: data.user_code,
                url: twitchConfig.oauth.activateUrl,
                expiresIn: data.expires_in,
                interval: data.interval
            }
        };
    }

    async function pollDeviceToken(deviceCode) {
        const clientId = await services.settingService.get("clientId", "twitch");

        if (!clientId.success) {
            return clientId;
        }

        const response = await fetch(
            twitchConfig.oauth.tokenUrl,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    client_id: clientId.data,
                    device_code: deviceCode,
                    grant_type: "urn:ietf:params:oauth:grant-type:device_code"
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            if (data.message === "authorization_pending") {
                return {
                    success: "pending"
                };
            }

            return {
                success: false,
                message: data.message,
            };
        }

        return {
            success: true,
            data: {
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                expiresIn: data.expires_in
            }
        }
    }

    // FIXME Handle token expiration
    async function awaitDeviceToken(deviceCode, interval, expiresIn) {
        let remainingTime = expiresIn;
        while(remainingTime > 0) { //Can this watch state.expired?
            // console.log("POLLING:", remainingTime > 0, remainingTime, interval);
            const {success, data, message} = await pollDeviceToken(deviceCode);

            if (success && data) {
                return {success, data};
            } else if (success === false) {
                return {success, message};
            }

            await sleep(interval * 1000); //Convert sec to ms
            remainingTime -= (interval);
        }

        return {success: false,
            message: "The token has expired"
        }
    }

    return {
        startDeviceAuth,
        pollDeviceToken,
        awaitDeviceToken,
    }
}