    
const AUTH_MODES = {
    HOSTED: "hosted",
    SELF_HOSTED: "self_hosted"
};

const AUTH_CLIENT_TYPES = {
    PUBLIC: "public",
    PRIVATE: "private"
};

const SETTINGS_DEFAULTS = [
    {
        key: 'auth_mode',
        section: "general",
        value: AUTH_MODES.HOSTED,
        type: "string",
        description: "Authentication provider mode",
    },
    {
        key: "clientType",
        section: "twitch",
        value: AUTH_CLIENT_TYPES.PUBLIC,
        type: "string",
        description: "Twitch"
    },
    {
        key: 'clientId',
        section: "twitch",
        value: 'dv469c3zeve91zn4krv8hoccz83b0w',
        type: "string",
        description: "Twitch application client ID"
    },
    {
        key: "clientSecret",
        section: "twitch",
        value: "",
        type: "password",
        description: "Private Twitch application client secret"
    }
];

export {
    SETTINGS_DEFAULTS,
    AUTH_MODES,
    AUTH_CLIENT_TYPES,
}