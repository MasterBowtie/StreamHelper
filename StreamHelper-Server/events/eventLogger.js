export function buildEventLogger({eventRepository, streamRepository}) {
    async function logger(message) {
        let streamId = null;
        const stream = await streamRepository.findActive();
        if (stream !== null) {
            streamId = stream.stream_id;
        }

        const event = {
            eventType: message.payload.subscription.type,
            twitchId: message.payload.event.user_id ?? null,
            streamId: streamId,
            occurredAt: message.payload.subscription.created_at,
            metadata: message
        }

        return await eventRepository.createEvent(event);
    }

    return logger;
}