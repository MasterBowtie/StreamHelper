

let startTime;


function buildSteamOnlineHandler({twitchApiClient}) {
    async function handler(event) {
        const stream = await twitchApiClient.getStream(event.broadcaster_user_id);
        console.log("Hello! Stream is online!");
        console.log(stream);
        startTime = new Date();
    }
    return handler;
}

function buildSteamOfflineHandler() {
    async function handler(event) {
        console.log("Steam Offline: Thanks for watching!")
        console.log("Stream Duration:", new Date().getMilliseconds() - startTime.getMilliseconds())
    }
    return handler;
}


export { buildSteamOfflineHandler, buildSteamOnlineHandler}