export const twitchConfig = {
    clientId: process.env.TWITCH_CLIENT_ID ?? "dv469c3zeve91zn4krv8hoccz83b0w",
    clientSecret: process.env.TWITCH_CLIENT_SECRET,
    redirectUri: process.env.TWITCH_REDIRECT_URI ?? "http://localhost:3141/twitch/auth/callback",

    oauth: {
        authUrl: "https://id.twitch.tv/oauth2/device",
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
        'chat:read',
        'chat:edit',
    ]
}