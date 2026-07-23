export const EVENTS = {
    TWITCH: {
        ALERTS: {
            ONLINE: "twitch.stream.online",
            OFFLINE: "twitch.stream.offline",
            FOLLOW: "twitch.channel.follow",
            SUBSCRIBE: "twitch.channel.subscribe",
            RAID: "twitch.channel.raid",
        },
        STATUS: {
            STATUS_CHANGE: "twitch.status.changed",
            CONNECT: "twitch.connect",
        }
    },
    APP: {
        CONNECTED: "app.connected",
        SETTINGS_UPDATED: "app.settings.updated",
        AUTH_REQUIRED: "app.auth.required",
        READY: "app.ready",
        EVENTSUB: {
            READY: "eventsub.connected",
            SUBSCRIBED: "eventsub.subscribed",
            STOP: 'eventsub.stopped',
        },
    },
    ERRORS: {
        CLIENT_ID: "error.auth.clientid",
        AUTH: "error.auth",
        EVENTSUB: 'error.eventsub',
    },
}