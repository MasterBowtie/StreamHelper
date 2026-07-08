function buildFollowHandler({followerRepository, twitchUserRepository}) {
    async function handler(event) {
        // Check for twitch User
        // let result = await twitchUserRepository.findByTwitchId(event.user_id);

        // if (result === null) {

        // }

        console.log(`${event.user_name} followed`);
        console.log(event);
    }

    return handler;
}

export { buildFollowHandler }