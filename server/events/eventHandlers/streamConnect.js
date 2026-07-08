function buildStreamOnlineHandler({twitchApiClient, streamRepository}) {
    async function handler(event) {
        const stream = await twitchApiClient.getStream(event.broadcaster_user_id);


        var activeStream = await streamRepository.findActive();
        if (!activeStream) {
            streamRepository.startStream(new Date(event.started_at));
            console.log("Hello! Stream is online!");
            console.log(stream);
        } else {
            // FIXME
            // Check twitch when last stream was...
            console.warn("There seems to already be a stream running")
            console.warn(activeStream);
        } 

    }
    return handler;
}

function buildStreamOfflineHandler({streamRepository}) {
    async function handler(event) {
        var stream = await streamRepository.findActive();
        var ended = await streamRepository.endStream(stream.id);
        console.log("Steam Offline: Thanks for watching!")
        if (ended) {
            stream = await streamRepository.getLatest();
            const streamStart = new Date(stream.started_at);
            const streamEnd = new Date(stream.end_at);
            console.log(`Stream duration: ${streamEnd - streamStart}`);
        } else {
            console.warn("There seems to have been a problem...")
        }
    }
    return handler;
}


export { buildStreamOfflineHandler, buildStreamOnlineHandler}