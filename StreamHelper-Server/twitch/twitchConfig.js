export const twitchConfig = {
    redirectUri: process.env.TWITCH_REDIRECT_URI ?? "http://localhost:3141/twitch/auth/callback",

    oauth: {
        activateUrl: "https://twitch.tv/activate",
        authUrl: "https://twitch.tv/oauth2/authorize",
        deviceUrl: "https://id.twitch.tv/oauth2/device",
        tokenUrl: 'https://id.twitch.tv/oauth2/token',
        validateUrl: 'https://id.twitch.tv/oauth2/validate'
    },

    helix: {
        baseUrl: "https://api.twitch.tv/helix"
    },

    eventSub: {
        wsUrl: "wss://eventsub.wss.twitch.tv/ws"
    },

    // Single-broadcaster scopes
    scopes: [
        'user:read:email',
        'channel:read:subscriptions',
        'moderator:read:followers',
        'channel:read:redemptions',
        'user:read:chat',
        'user:write:chat',
    ]
}