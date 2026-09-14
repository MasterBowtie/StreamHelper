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
        },
        {
            type: "channel.subscribe",
            version: "1",
            condition: {
                broadcaster_user_id: broadcaster.twitch_id
            },
        },
        {
            type: "channel.raid",
            version: "1",
            condition: {
                to_broadcaster_user_id: broadcaster.twitch_id
            }
        },
        {
            type: "channel.chat.message",
            version: "1",
            condition: {
                broadcaster_user_id: broadcaster.twitch_id,
                user_id: broadcaster.twitch_id
            }
        },
        {
            type: "channel.chat.clear",
            version: "1",
            condition: {
                broadcaster_user_id: broadcaster.twitch_id,
                user_id: broadcaster.twitch_id
            }
        },
        {
            type: "channel.chat.message_delete",
            version: "1",
            condition: {
                broadcaster_user_id: broadcaster.twitch_id,
                user_id: broadcaster.twitch_id
            }
        },
        {
            type: "channel.chat.clear_user_messages",
            version: "1",
            condition: {
                broadcaster_user_id: broadcaster.twitch_id,
                user_id: broadcaster.twitch_id
            }
        },
        {
            type: "channel.chat.notification",
            version: "1",
            condition: {
                broadcaster_user_id: broadcaster.twitch_id,
                user_id: broadcaster.twitch_id
            }
        }, 
        {
            type: "automod.message.hold",
            version: "1",
            condition: {
                broadcaster_user_id: broadcaster.twitch_id,
                moderator_user_id: broadcaster.twitch_id,
            }
        },
        {
            type: "automod.message.update",
            version: "1",
            condition: {
                broadcaster_user_id: broadcaster.twitch_id,
                moderator_user_id: broadcaster.twitch_id,
            }
        },
        {
            type: "channel.channel_points_custom_reward_redemption.add",
            version: "1",
            condition: {
                broadcaster_user_id: broadcaster.twitch_id, 
            }
        }
    ]
}