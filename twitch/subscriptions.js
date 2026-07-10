export function getSubscriptions(broadcaster) {
    return [
        {
            type: "stream.online",
            version: "1",
            condition: { broadcaster_user_id: broadcaster.twitchId }
        },
        {
            type: "stream.offline",
            version: "1",
            condition: { broadcaster_user_id: broadcaster.twitchId }
        },
        {
            type: "channel.follow",
            version: "2",
            condition: {
                broadcaster_user_id: broadcaster.twitchId,
                moderator_user_id: broadcaster.twitchId
            }
        },
        {
            type: "channel.subscribe",
            version: "1",
            condition: {
                broadcaster_user_id: broadcaster.twitchId
            },
        }
    ]
}