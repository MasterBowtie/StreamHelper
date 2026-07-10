export function buildTwitchStatusService({ twitchUserRepository }) {
    async function getStatus() {
        const broadcaster = await twitchUserRepository.getBroadcaster();

        if (!broadcaster) {
            return {
                authentication: false
            };
        }

        return {
            authentication: true,
            broadcaster: {
                broadcaster: {
                    twitchId: broadcaster.twitch_id,
                    displayName: broadcaster.display_name
                }
            }
        }
    }

    return {
        getStatus
    };
}