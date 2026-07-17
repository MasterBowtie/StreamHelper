    
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
        key: 'auth.mode',
        value: AUTH_MODES.HOSTED,
        type: "string",
        description: "Authentication provider mode",
    },
    {
        key: "twitch.clientType",
        value: AUTH_CLIENT_TYPES.PUBLIC,
        type: "string",
        description: "Twitch"
    },
    {
        key: 'twitch.clientId',
        value: 'mxrc75kg0ydkt2wo4lyhejgpbo9s3d',
        type: "string",
        description: "Twitch application client ID"
    }
];

export {
    SETTINGS_DEFAULTS,
    AUTH_MODES,
    AUTH_CLIENT_TYPES,
}