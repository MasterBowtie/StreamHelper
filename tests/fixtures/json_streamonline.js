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
                "id": "subscription-id",
                "status": "enabled",
                "type": "stream.online",
                "version": "1",
                "condition": {
                    "broadcaster_user_id": "12345678"
                },
                "transport": {
                    "method": "websocket",
                    "session_id": "session-id"
                },
                "created_at": "2026-06-26T12:00:00.000Z"
            },
            "event": {
                "id": "stream-event-id",
                "broadcaster_user_id": "12345678",
                "broadcaster_user_login": "mctesterson",
                "broadcaster_user_name": "Test McTesterson",
                "type": "live",
                "started_at": "2026-06-26T18:30:00.000Z"
            }
        }
    }