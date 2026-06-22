export const twitchConfig = {
    clientId: process.env.TWITCH_CLIENT_ID,
    clientSecret: process.env.TWITCH_SECRET,
    redirectUri: process.env.TWITCH_REDIRECT_URI,

    authUrl: 'https://id.twitch.tv/oauth2/authorize',
    tokenUrl: 'https://id.twitch.tv/oauth2/token',
    validateUrl: 'https://id.twitch.tv/oauth2/validate'
}