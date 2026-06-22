import { twitchConfig } from "twitchConfig.js";

export async function exchangeCodeForToken(code) {
    const response = await fetch(twitchConfig.tokenUrl, {
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

    if (!response.ok) {
        throw new Error("Failed to exchange code for token");
    }

    return await response.json();
}

export function getLoginUrl() {
    const params = new URLSearchParams ({
        client_id: twitchConfig.clientId,
        redirect_uri: twitchConfig.redirectUri,
        response_type: 'code',
        scope: [
            "channel:bot",
            "user:read:chat",
            "moderator:manage:announcements",
            "moderator:read:followers"
        ].join(' ')
    });

    return `${twitchConfig.authUrl}?${params}`
}