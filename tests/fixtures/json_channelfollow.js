export default {
    "metadata": {
        "message_id": "e9f4b8a1-1234-5678-9999-abcdef123456",
        "message_type": "notification",
        "message_timestamp": "2026-06-26T18:30:00.000Z",
        "subscription_type": "stream.online",
        "subscription_version": "1"
    },
    "payload": {
        "subscription": {
            "id": "f1c2a387-161a-49f9-a165-0f21d7a4e1c4",
            "type": "channel.follow",
            "version": "2",
            "status": "enabled",
            "cost": 0,
            "condition": {
            "broadcaster_user_id": "1337",
            "moderator_user_id": "1337"
            },
            "transport": {
                "method": "webhook",
                "callback": "https://example.com/webhooks/callback"
            },
            "created_at": "2019-11-16T10:11:12.634234626Z"
        },
        "event": {
            "user_id": "1234",
            "user_login": "cool_user",
            "user_name": "Cool_User",
            "broadcaster_user_id": "1337",
            "broadcaster_user_login": "cooler_user",
            "broadcaster_user_name": "Cooler_User",
            "followed_at": "2020-07-15T18:16:11.17106713Z"
        }
    }
}