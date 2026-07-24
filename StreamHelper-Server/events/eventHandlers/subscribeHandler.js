import { EVENTS } from "../../websocket/events.js";

function buildSubscriptionHandler({db, services, websocket}) {
    async function handler(event, eventId) {
        services.twitchUserService(event)

        let sub = {
            twitchId: event.user_id,
            eventId: eventId,
            tier: event.tier,
            isGift: event.is_gift,
            verified: new Date(),
        }

        const result = await db.subscriptionRepository.getSubscriberById(sub.twitchId);

        if (result === null) {
            await db.subscriptionRepository.addSubscriber(sub);
        } else {
            await db.subscriptionRepository.updateSubscriber(sub);
        }

        console.log(`Twitch Alert: ${event.user_name} Subscribed!`);
        websocket.notifier.notify(EVENTS.TWITCH.ALERTS.SUBSCRIBE, {displayName: event.user_name, isGift: event.is_gift, tier: event.tier});
    }
    return handler;
}

function buildSubscriptionEndHandler({db}) {
    async function handler(event, eventId) {
        const result = await db.subscriptionRepository.getSubscriberById(event.user_id);
        if (result === null) {
            console.warn("Subscription End: No subscriber with that Id");
        }

        await db.subscriptionRepository.updateSubscriber({
            twitchId: event.user_id,
            isSubscribed: false,
            verified: new Date(),
        })
    }

    return handler;
}

export {buildSubscriptionHandler, buildSubscriptionEndHandler}