// May be redundant...
export async function getTwitchStatus(db) {
    const broadcaster = await db.twitchUserRepository.getBroadcaster();

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
