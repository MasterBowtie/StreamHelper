import { twitchConfig } from "./twitchConfig.js";

function buildTwitchApiClient({
    tokenManager
}) {
    async function request(endpoint, options = {}) {
        const accessToken = await tokenManager.getValidAccessToken();
        const response = await fetch(`${twitchConfig.helix.baseUrl}${endpoint}`,
            {
                ...options,
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Client-Id': twitchConfig.clientId,
                    ...options.headers
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Twitch API Error: ${response.status}`);
        }

        return await response.json();
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

    return {
        getCurrentUser,
        createEventSubSubscription,
        getEventSubSubscriptions
    }
}

export {
    buildTwitchApiClient
}