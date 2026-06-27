export function buildEventDispatcher() {
    const handlers = {};

    function registerHandler(eventType, handler) {
        handlers[eventType] = handler;
    }
    
    async function dispatch(message) {
        const eventType = message.payload.subscription.type;

        const handler = handlers[eventType];
        if (!handler) {
            console.warn("Unhandled EventSub event:", eventType);
            return;
        }

        await handler(message.payload.event);
    }

    return { registerHandler, dispatch }
}