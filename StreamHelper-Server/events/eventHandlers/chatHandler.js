import { EVENTS } from "../../websocket/events.js";

function buildChatHandler({websocket}) {
    const pendingMessages = new Map();
    const heldMessages = new Map();

    async function messageHandler(event) {
        const messageId = event.message_id;

        const message = {
            event,
            approved: null,
        };

        pendingMessages.set(messageId, message);

        setTimeout(()=> {
            const pending = pendingMessages.get(messageId);

            if (!pending) return;

            pendingMessages.delete(messageId);

            if (pending.approved !== false) {
                websocket.notifier.notify(EVENTS.TWITCH.ALERTS.CHAT, pending.event);
            }
        }, 1000);
    }

    async function holdHandler(event) {
        const messageId = event.message.message_id;

        const pending = pendingMessages.get(messageId);

        if (pending) {
            pendingMessages.delete(messageId);
            heldMessages.set(messageId, pending);
            return;
        }

        // Hold arrived after the pending message was released.
        // Keep this here is case Twitch delivers the events out of order
        heldMessages.set(messageId, {event, approved: false});
        // Send websocket to remove already sent chat message.
        websocket.notifier.notify(EVENTS.TWITCH.ALERTS.DELETE, messageId);
    }

    async function updateHandler(event) {
        const messageId = event.message.message_id;

        const held = heldMessages.get(messageId);

        if (!held) {
            return;
        }

        held.approved = event.status === "approved";

        if (held.approved) {
            websocket.notifier.notify(EVENTS.TWITCH.ALERTS.CHAT, held.event);
            heldMessages.delete(messageId);
        } else if (event.status === "denied" || event.status === "expired") {
            heldMessages.delete(messageId);
        }
    }

    async function deleteHandler(event) {
        const messageId = event.message_id;
        pendingMessages.delete(messageId);
        heldMessages.delete(messageId);
        websocket.notifier.notify(EVENTS.TWITCH.ALERTS.DELETE, messageId);
    }

    async function clearHandler(event) {
        pendingMessages.clear();
        heldMessages.clear();
        websocket.notifier.notify(EVENTS.TWITCH.ALERTS.CLEAR);
    }

    async function clearUserHandler(event) {
        for (const [key, pending] of pendingMessages) {
            if (pending.event.chatter_user_id === event.target_user_id) {
                pendingMessages.delete(key);
            }
        }
        for (const [key, held] of heldMessages) {
            if (held.event.chatter_user_id === event.target_user_id) {
                heldMessages.delete(key);
            }
        }
        websocket.notifier.notify(EVENTS.TWITCH.ALERTS.CLEAR_USER, event.target_user_id);
    }

    return {
        messageHandler,
        holdHandler,
        updateHandler,
        deleteHandler,
        clearHandler,
        clearUserHandler,
    };
}

function buildChatNotificationHandler({db, websocket}) {
    async function handler(event) {
        websocket.notifier.notify(EVENTS.TWITCH.ALERTS.NOTIFICATION, event);
        let sub = {};
        let result = null;

        switch(event.notice_type) {

            case "sub":
                sub = {
                    twitchId: event.chatter_user_id,
                    months: event.sub.duration_months,
                    tier: event.sub.sub_tier
                }

                result = await db.subscriptionRepository.getSubscriberById(sub.twitchId);

                if (result === null) {
                    await db.subscriptionRepository.addSubscriber(sub);
                } else {
                    await db.subscriptionRepository.updateSubscriber(sub);
                }
                break;

            case "resub":
                sub = {
                    twitchId: event.chatter_user_id,
                    months: event.resub.cumulative_months,
                    tier: event.resub.sub_tier
                }
                await db.subscriptionRepository.updateSubscriber(sub);

                // websocket.notifier.notify(EVENTS.TWITCH.ALERTS.SUBSCRIBE, event);

                break;

            case "sub_gift":
                sub = {
                    twitchId: event.sub_gift.recipient_user_id,
                    tier: event.sub_gift.sub_tier,
                    giftedBy: event.chatter_user_id,
                    months: event.sub_gift.duration_months,
                    isGift: true
                }
            
                result = await db.subscriptionRepository.getSubscriberById(sub.twitchId);

                if (result === null) {
                    await db.subscriptionRepository.addSubscriber(sub);
                } else {
                    await db.subscriptionRepository.updateSubscriber(sub);
                }
                break;
        }
    }

    return handler;
}

export { buildChatHandler, buildChatNotificationHandler }