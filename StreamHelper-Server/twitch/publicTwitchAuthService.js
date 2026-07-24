import { twitchConfig } from "./twitchConfig.js";
import { sleep } from "../server/sleep.js";

export function buildPublicTwitchAuthService({db, services}) {
    async function startDeviceAuth() {
        const clientId = await services.settingService.get("twitch.clientId");

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
                deviceCode: data.device_code,
                userCode: data.user_code,
                verificationUrl: data.verification_url,
                expiresIn: data.expires_in,
                interval: data.interval
            }
        };
    }

    async function pollDeviceToken(deviceCode) {
        const clientId = await services.settingService.get("twitch.clientId");

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

    async function awaitDeviceToken(deviceCode, interval) {
        while(true) {
            const {success, data, message} = await pollDeviceToken(deviceCode);

            if (success && data) {
                return {success, data};
            } else if (success === false) {
                return {success, message};
            }

            await sleep(interval);
        }
    }

    return {
        startDeviceAuth,
        pollDeviceToken,
        awaitDeviceToken,
    }
}