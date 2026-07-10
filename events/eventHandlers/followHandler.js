import { EVENTS } from "../events.js";

function buildFollowHandler({db, services, websocket}) {
    async function handler(event, eventId) {
        await services.twitchUserService(event);

        // Check for previous follow
        const result = await db.followerRepository.findByTwitchId(event.user_id);
        if (result !== null) {
            await db.followerRepository.updateFollower({
                twitchId: event.user_id,
                eventId: eventId,
                verify: new Date(),
                isFollowing: true
            });
        } else {
            await db.followerRepository.createFollower({
                twitchId: event.user_id,
                eventId: eventId
            })
        }

        await websocket.notifier.publish(EVENTS.FOLLOW, {
            displayName: event.user_name
        });

        console.log(`${event.user_name} followed`);
    }

    return handler;
}

export { buildFollowHandler }