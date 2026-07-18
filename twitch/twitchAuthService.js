import { twitchConfig } from "./twitchConfig.js";
import { AUTH_CLIENT_TYPES } from "../server/constants.js"

export function buildTwitchAuthService({authService, services}) {

    async function authenticateBroadcaster(authRequest) {
        let token;
        switch (authRequest.type) {
            case "public":
                token = await authService.pollDeviceToken(authRequest.deviceCode);
                break;
            case "private":
                token = await authService.exchangeCodeForToken(authRequest.code);
                break;
            
            default:
                throw new Error(`Unsupported authentication type: ${authRequest.type}`)
        }

        const twitchUser = await fetchTwitchUser(token.accessToken);

        return {
            twitchUser,
            token
        };
    }
    
    async function fetchTwitchUser(accessToken) {
        const clientId = await services.settingService.get("twitch.clientId");

        const response = await fetch(
            `${twitchConfig.helix.baseUrl}/users`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Client-Id': clientId
                }
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch Twitch user");
        }

        const data = await response.json();

        if (data.data.length === 0) {
            throw new Error("User not found");
        }

        return {
            twitchId: data.data[0].id,
            login: data.data[0].login,
            displayName: data.data[0].display_name
        };
    }

    async function refreshAccessToken(refreshToken) {
        const clientType = await services.settingService.get("twitch.clientType")
        const clientId = await services.settingService.get("twitch.clientId");

        const params = new URLSearchParams({
                    client_id: clientId,
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken
                });
        
        if (clientType === AUTH_CLIENT_TYPES.PRIVATE) {
            params.append("client_secret", await services.settingService.get("twitch.clientSecret"));
        }


        const response = await fetch(
            twitchConfig.oauth.tokenUrl,
            {
                method: "POST",
                headers: {
                    "Content-Type": 'application/x-www-form-urlencoded'
                },
                body: params
            }
        );

        const tokenData = await response.json();

        if (!response.ok) {
                console.log("refreshAccessToken", tokenData)
                return {
                    success: false,
                    reason: tokenData.message
                };
        }

        return {
            success: true,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresIn: tokenData.expires_in
        }
    }

    return  {
        fetchTwitchUser,
        authenticateBroadcaster,
        refreshAccessToken,
    };
}