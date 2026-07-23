import { twitchConfig } from "./twitchConfig.js";

function buildTwitchApiClient({
    tokenManager,
    services
}) {
    async function request(endpoint, options = {}) {
        const token = await tokenManager.getValidAccessToken();
        const clientId = await services.settingService.get("twitch.clientId");

        if (!token && token.success === false) {
            console.error("Error:", token.message);
            return {success: false, message: "No Access Token"};
        }

        const response = await fetch(`${twitchConfig.helix.baseUrl}${endpoint}`,
            {
                ...options,
                headers: {
                    'Authorization': `Bearer ${token.data.accessToken}`,
                    'Client-Id': clientId.data,
                    'Content-Type': 'application.json',
                    ...options.headers
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Twitch API Error:", data)
            // throw new Error(`Twitch API Error: ${response.status} ${JSON.stringify(error)}`);
        }
        return {
            success: true,
            ...data
        };
    }

    async function getCurrentUser() {
        const data = await request('/users');

        return data.data[0]
    }

    async function createEventSubSubscription({
        type,
        version,
        condition,
        sessionId
    }) {

        return await request(
            '/eventsub/subscriptions',
            {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type,
                    version,
                    condition,
                    transport: {
                        method: 'websocket',
                        session_id: sessionId
                    }
                })
            }
        )
    }

    async function getEventSubSubscriptions() {
        return request('/eventsub/subscriptions');
    }

    async function getStream(userId) {
        const data = await request(`/stream?user_id=${userId}`);

        return data.data[0] ?? null;
    }

    async function getChannelInformation(userId) {
        const data = await request(`/channels?broadcaster_id=${userId}`);

        return data.data[0] ?? null;
    }

    return {
        getCurrentUser,
        createEventSubSubscription,
        getEventSubSubscriptions,
        getStream,
        getChannelInformation,
    }
}

export {
    buildTwitchApiClient
}