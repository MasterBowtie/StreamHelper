import { EVENTS } from "../../websocket/events";

function buildChatHandler({websocket}) {
    async function handler(event) {
        websocket.notifier.notify(EVENTS.TWITCH.ALERTS.CHAT, event);
    }

    return handler;
}

function buildChatNotificationHandler({db, websocket}) {
    async function handler(event) {
        websocket.notifier.notify(EVENTS.TWITCH.ALERTS.NOTIFICATION, event);

        switch(event.notice_type) {

            case "sub_gift":
                let sub = {
                    twitchId: event.sub_gift.recipient_user_id,
                    tier: event.sub_gift.sub_tier,
                    giftedBy: event.chatter_user_id,
                    months: event.sub_gift.duration_months,
                    isGift: true
                }
            
                const result = await db.subscriptionRepository.getSubscriberById(sub.twitchId);

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