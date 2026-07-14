import { EVENTS } from "../events.js";

function buildStreamOnlineHandler({twitch, db, websocket}) {
    async function handler(event) {
        const stream = await twitch.twitchApiClient.getStream(event.broadcaster_user_id);

        var activeStream = await db.streamRepository.findActive();
        if (!activeStream) {
            await db.streamRepository.startStream(new Date(event.started_at));
            console.log("Hello! Stream is online!");
            await websocket.notifier.publish(EVENTS.ONLINE);
        } else {
            // FIXME
            // Check twitch when last stream was...
            console.warn("There seems to already be a stream running")
            console.warn(activeStream);
        } 

    }
    return handler;
}

function buildStreamOfflineHandler({db, websocket}) {
    async function handler(event) {
        var stream = await db.streamRepository.findActive();
        var ended = await db.streamRepository.endStream(stream.id);
        
        if (ended) {
            stream = await db.streamRepository.getLatest();
            const streamStart = new Date(stream.started_at);
            const streamEnd = new Date(stream.end_at);
            console.log(`Stream duration: ${streamEnd - streamStart}`);

            await websocket.notifier.publish(EVENTS.OFFLINE, {
                duration: streamEnd - streamStart
            });
        } else {
            console.warn("There seems to have been a problem...")
        }
        console.log("Steam Offline: Thanks for watching!")
    }
    return handler;
}


export { buildStreamOfflineHandler, buildStreamOnlineHandler}