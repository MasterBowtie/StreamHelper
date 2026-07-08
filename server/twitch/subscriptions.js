export function getSubscriptions(broadcaster) {
    return [
        {
            type: "stream.online",
            version: "1",
            condition: { broadcaster_user_id: broadcaster.twitch_id }
        },
        {
            type: "stream.offline",
            version: "1",
            condition: { broadcaster_user_id: broadcaster.twitch_id }
        },
        {
            type: "channel.follow",
            version: "2",
            condition: {
                broadcaster_user_id: broadcaster.twitch_id,
                moderator_user_id: broadcaster.twitch_id
            }
        }
    ]
}