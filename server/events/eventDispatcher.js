export function buildEventDispatcher({eventLogger}) {
    const handlers = {};

    function registerHandler(eventType, handler, persistent) {
        handlers[eventType] = {handler: handler, persistent: persistent};
    }
    
    async function dispatch(message) {
        
        const eventType = message.payload.subscription.type
        const event = handlers[eventType];
        let eventId = null;

        if (!event) {
            console.warn("Unhandled EventSub event:", eventType);
            return;
        }
        if (event.persistent) {
            eventId = await eventLogger(message);
        }
        await event.handler(message.payload.event, eventId);
    }

    return { registerHandler, dispatch }
}