export function buildPublicTwitchAuthService({services}) {
    async function startDeviceAuth() {
        const clientId = await services.settingService.get("twitch.clientId");

        const response = await fetch(twitchConfig.oauth.authUrl,
            {
                method: "POST",
                headers: {
                    "Content-Type": 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    client_id: clientId,
                    scopes: twitchConfig.scopes.join(" ")
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error("OAuth Error:", data.message);
        }

        return {
            deviceCode: data.device_code,
            userCode: data.user_code,
            verificationUrl: data.verification_url,
            expiresIn: data.expires_in,
            interval: data.interval
        };
    }

    async function pollDeviceToken(deviceCode) {
        const clientId = await services.settingService.get("twitch.clientId");

        const response = await fetch(
            twitchConfig.tokenUrl,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    client_id: clientId,
                    device_code: deviceCode,
                    grant_type: "urn:ietf:params:oauth:grant-type:device_code"
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            if (data.message === "authorization_pending") {
                return null;
            }

            throw new Error(data.message);
        }

        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresIn: data.expires_in
        }
    }

    return {
        startDeviceAuth,
        pollDeviceToken
    }
}