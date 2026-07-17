export function createMessage(type, payload) {
    return {
        type,
        payload,
        timestamp: new Date().toISOString(),
        version: 1,
    };
}