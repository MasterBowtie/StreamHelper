import { EVENTS } from "../../websocket/events.js";

function buildChatHandler({websocket, twitch}) {
    const pendingMessages = new Map();
    const heldMessages = new Map();
    const badgeCache = new Map();
    const emoteCache = new Map();

    async function initialize() {
        const broadcasterId = await twitch.getStatus()?.broadcaster?.twitchId;
        if (broadcasterId === null) return;

        let badges = await twitch.twitchApiClient.getBadges(broadcasterId);
        for (const badge of badges) {
            for (const version of badge.versions) {
                badgeCache.set(`${badge.set_id}:${version.id}`, 
                    {
                        url1x: version.image_url_1x,
                        url2x: version.image_url_2x,
                        url4x: version.image_url_4x,
                    });
            }
        }

        let emotes = await twitch.twitchApiClient.getEmotes(broadcasterId);

        for (const emote of emotes) {
            emoteCache.set(emote.id, {
                url1x: emote.images.url_1x,
                url2x: emote.images.url_2x,
                url4x: emote.images.url_4x,
            })
        }
    }

    // WebSocket Handlers
    async function messageHandler(event) {
        const messageId = event.message_id;

        const badges = event.badges.map(badge => ({
            ...badge, url: badgeCache.get(`${badge.set_id}:${badge.id}`)?.url2x ?? "/assets/emotes/missing.svg"
        }));

        const fragments = event.message.fragments.map(fragment => {
            if (fragment.type === "emote") {
                return {
                    type: "emote",
                    text: fragment.text,
                    url: emoteCache.get(fragment.emote.id)?.url2x ?? "/assets/emotes/missing.svg"
                }
            }
            return {
                type: "text",
                text: fragment.text
            }
        })

        const message = {
            event: {
                message_id: event.message_id,
                chatter_user_id: event.chatter_user_id,
                chatter_user_name: event.chatter_user_name,
                color: event.color,
                badges,
                fragments,                
            },
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
        initialize,
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