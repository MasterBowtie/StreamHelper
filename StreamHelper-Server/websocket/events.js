export const EVENTS = {
    TWITCH: {
        ALERTS: {
            ONLINE: "twitch.stream.online",
            OFFLINE: "twitch.stream.offline",
            FOLLOW: "twitch.follow",
            SUBSCRIBE: "twitch.subscribe",
            RAID: "twitch.raid",
            CHAT: "twitch.chat.message",
            NOTIFICATION: 'twitch.chat.notification'
        },
        STATUS: {
            STATUS_CHANGE: "twitch.status.changed",
            CONNECT: "twitch.connect",
            AUTH_REQUIRED: "twitch.auth.required",
        }
    },
    APP: {
        SETTINGS_UPDATED: "app.settings.updated",
        READY: "app.ready",
        EVENTSUB: {
            READY: "eventsub.connected",
            SUBSCRIBED: "eventsub.subscribed",
            STOP: 'eventsub.stopped',
        },
    },
    ERRORS: {
        CLIENT_ID: "error.auth.clientid",
        TWITCH_CONNECT: "error.twitch.connect",
        AUTH: "error.auth",
        EVENTSUB: 'error.eventsub',
    },
}