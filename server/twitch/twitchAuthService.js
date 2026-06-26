import { twitchConfig } from "./twitchConfig.js";

function buildTwitchAuthService() {

    async function exchangeCodeForToken(code) {
        const response = await fetch(twitchConfig.oauth.tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            client_id: twitchConfig.clientId,
            client_secret: twitchConfig.clientSecret,
            code,
            grant_type: "authorization_code",
            redirect_uri: twitchConfig.redirectUri
            })
        });
        const data = await response.json();
    
        if (!response.ok) {
            console.error(data)
            throw new Error("Failed to exchange code for token:", JSON.stringify(data));
        }
        
        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresIn: data.expires_in
        }
    }

    function getLoginUrl() {
        const params = new URLSearchParams ({
            client_id: twitchConfig.clientId,
            redirect_uri: twitchConfig.redirectUri,
            response_type: 'code',
            scope: twitchConfig.scopes.join(' ')
        });

        return `${twitchConfig.oauth.authUrl}?${params}`;
    }

    async function fetchTwitchUser(accessToken) {
        const response = await fetch(
            `${twitchConfig.helix.baseUrl}/users`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Client-Id': twitchConfig.clientId
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

    async function authenticateBroadcaster(code) {
        const token = await exchangeCodeForToken(code);
        const twitchUser = await fetchTwitchUser(token.accessToken);

        return {
            twitchUser,
            token
        };
    }

    async function refreshAccessToken(refreshToken) {
        const response = await fetch(
            twitchConfig.oauth.tokenUrl,
            {
                method: "POST",
                headers: {
                    "Content-Type": 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    client_id: twitchConfig.clientId,
                    client_secret: twitchConfig.clientSecret,
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken
                })
            }
        );

        if (!response.ok) {
            throw new Error('Failed to refresh access token')
        }

        const tokenData = await response.json();

        return {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresIn: tokenData.expires_in
        }
    }

    return  {
        getLoginUrl,
        exchangeCodeForToken,
        fetchTwitchUser,
        authenticateBroadcaster,
        refreshAccessToken
    };
}

export { buildTwitchAuthService }