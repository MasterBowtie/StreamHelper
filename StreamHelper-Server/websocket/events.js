export const EVENTS = {
    TWITCH: {
        ONLINE: "stream.online",
        OFFLINE: "stream.offline",
        FOLLOW: "channel.follow",
        SUBSCRIBE: "channel.subscribe",
        RAID: "channel.raid",
    },
    APP: {
        TWITCH_STATUS_CHANGE: "twitch.status.changed",
        CONNECTED: "app.connected",
        SETTINGS_UPDATED: "app.settings.updated",
        AUTH_REQUIRED: "app.auth.required",
        READY: "app.ready",
        TWITCH_CONNECT: "twitch.connect",
    },
    ERRORS: {
        CLIENT_ID_ERROR: "error.client.id.invalid",
        CLIENT_INVALID: "error.client.invalid",
    },
}