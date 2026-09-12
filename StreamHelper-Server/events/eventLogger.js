export function buildEventLogger({eventRepository, streamRepository, twitchUserRepository}) {
    async function logger(message) {
        let streamId = null;
        const stream = await streamRepository.findActive();
        if (stream !== null) {
            streamId = stream.stream_id;
        }

        console.log("EVENT LOGGER", message);

        // const user = await twitchUserRepository.findByTwitchId(message.payload.event.user_id);

        // if (!user) {
        //     await twitchUserRepository.createTwitchUser({
        //         twitchId: message.payload.event.user_id, 
        //         login: message.payload.event.user_login, 
        //         displayName: message.payload.event.user_name
        //     });
        // }

        const event = {
            eventType: message.payload.subscription.type,
            twitchId: message.payload.event.user_id ?? null,
            streamId: streamId,
            occurredAt: new Date(message.payload.subscription.created_at),
            metadata: message
        }

        return await eventRepository.createEvent(event);
    }

    return logger;
}