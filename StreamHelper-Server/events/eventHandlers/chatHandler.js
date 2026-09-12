import { EVENTS } from "../../websocket/events.js";

function buildChatHandler({websocket}) {
    async function handler(event) {
        // console.log("Message", event);
        websocket.notifier.notify(EVENTS.TWITCH.ALERTS.CHAT, event);
    }

    return handler;
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