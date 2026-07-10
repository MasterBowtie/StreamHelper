function buildFollowHandler({followerRepository, twitchUserService}) {
    async function handler(event, eventId) {
        await twitchUserService(event);

        // Check for previous follow
        const result = await followerRepository.findByTwitchId(event.user_id);
        if (result !== null) {
            await followerRepository.updateFollower({
                twitchId: event.user_id,
                eventId: eventId,
                verify: new Date(),
                isFollowing: true
            });
        } else {
            await followerRepository.createFollower({
                twitchId: event.user_id,
                eventId: eventId
            })
        }

        console.log(`${event.user_name} followed`);
    }

    return handler;
}

export { buildFollowHandler }