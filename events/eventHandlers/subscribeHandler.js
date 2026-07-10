export function buildSubscriptionHandler({subscriptionRepository, twitchUserService}) {
    async function handler(event, eventId) {
        twitchUserService(event)

        const result = await subscriptionRepository.getSubscriberById(event.user_id);
        if (result === null) {
            await subscriptionRepository.addSubscriber({
                twitchId: event.user_id,
                eventId: eventId,
                tier: event.tier,
                isGift: event.is_gift
            })
        } else {
            await subscriptionRepository.updateSubscriber({
                twitchId: event.user_id,
                eventId: eventId,
                tier: event.tier,
                isGift: event.is_gift,
                verified: new Date()
            })
        }

    }
    return handler;
}