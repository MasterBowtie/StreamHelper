import { twitchConfig } from "./twitchConfig.js";
import { AUTH_CLIENT_TYPES } from "../server/constants.js"

export function buildTwitchAuthService({db, publicTwitchAuth, privateTwitchAuth, services}) {

    async function authenticateBroadcaster(authRequest) {
        let token;
        switch (authRequest.type) {
            case "public":
                // FIXME: handle new data
                token = await publicTwitchAuth.pollDeviceToken(authRequest.deviceCode);
                break;
            case "private":
                // FIXME: handle new data
                token = await privateTwitchAuth.exchangeCodeForToken(authRequest.code);
                break;
            
            default:
                return {
                    success: false,
                    message: `Twitch Auth: Unsupported authentication type ${authRequest.type}`
                }
        }

        if (!token.success) {
            return token;
        }

        const twitchUser = await fetchTwitchUser(token.data.accessToken);

        if (!twitchUser.success) {
            return twitchUser;
        }

        await db.twitchUserRepository.updateBroadcaster({
                twitchUser: twitchUser.data,
                token: token.data,
            })

        return {
            success: true,
            data: {
                twitchUser: twitchUser.data,
                token: token.data,
            }
        };
    }
    
    async function fetchTwitchUser(accessToken) {
        const clientId = await services.settingService.get("clientId", "twitch");

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
            success: true,
            data: {
                twitchId: data.data[0].id,
                login: data.data[0].login,
                displayName: data.data[0].display_name
            }
        };
    }

    async function refreshAccessToken(refreshToken) {
        const clientType = await services.settingService.get("clientType", "twitch");
        const clientId = await services.settingService.get("clientId", "twitch");

        if (clientType.success === false) {
            console.log("Twitch Auth Error:", clientType.message);
            return clientType;
        } else if (clientId.success === false) {
            console.log("Twitch Auth Error:", clientId.message);
            return clientId;
        }

        const params = new URLSearchParams({
                    client_id: clientId.data,
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken
                });
        
        if (clientType.data === AUTH_CLIENT_TYPES.PRIVATE) {
            params.append("client_secret", await services.settingService.get("clientSecret", "twitch"));
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
                // console.log("refreshAccessToken", tokenData)
                return {
                    success: false,
                    message: `RefreshAccessToken: ${tokenData.message}`
                };
        }

        return {
            success: true,
            data: {
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                expiresIn: tokenData.expires_in
            }
        }
    }

    return  {
        fetchTwitchUser,
        authenticateBroadcaster,
        refreshAccessToken,
    };
}