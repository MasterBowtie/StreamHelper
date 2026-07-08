function buildFollowHandler({followerRepository, twitchUserRepository}) {
    async function handler(event, eventId) {
        // Check for twitch User
        let result = await twitchUserRepository.findByTwitchId(event.user_id);

        // Check for Twitch User
        if (result === null) {
            await twitchUserRepository.createTwitchUser({
                twitchId: event.user_id,
                login: event.user_login,
                displayName: event.user_name
            });
        } else if (result.display_name !== event.user_name) {
            await twitchUserRepository.updateIdentity({
                twitchId: event.user_id,
                displayName: event.user_name
            });
        }

        // Check for previous follow
        result = await followerRepository.findByTwitchId(event.user_id);
        if (result !== null) {
            followerRepository.updateFollower({
                twitchId: event.user_id,
                eventId: eventId,
                verify: new Date(),
                isFollowing: true
            });
        } else {
            followerRepository.createFollower({
                twitchId: event.user_id,
                eventId: eventId
            })
        }

        console.log(`${event.user_name} followed`);
    }

    return handler;
}

export { buildFollowHandler }