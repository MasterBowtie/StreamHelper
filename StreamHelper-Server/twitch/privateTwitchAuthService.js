import { twitchConfig } from "./twitchConfig.js";

export function buildPrivateTwitchAuthService({services}) {

    async function exchangeCodeForToken(code) {
        const clientId = await services.settingService.get("clientId", "twitch");
        const response = await fetch(twitchConfig.oauth.tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: twitchConfig.clientSecret,
            code,
            grant_type: "authorization_code",
            redirect_uri: twitchConfig.redirectUri
            })
        });
        const data = await response.json();
    
        if (!response.ok) {
            return {
                success: false,
                message: "Private Auth: Failed to exchange code for token",
                data: JSON.stringify(data),
            }
        }
        
        return{
            success: true,
            data: {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresIn: data.expires_in
            },
        }
    }

    async function getLoginUrl() {
        const clientId = await services.settingService.get("clientId", "twitch");

        const params = new URLSearchParams ({
            client_id: clientId.data,
            redirect_uri: twitchConfig.redirectUri,
            response_type: 'code',
            scope: twitchConfig.scopes.join(' ')
        });

        return `${twitchConfig.oauth.authUrl}?${params}`;
    }

    

    return {
        getLoginUrl,
        exchangeCodeForToken
    }
}