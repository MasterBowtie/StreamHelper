import { EVENTS } from "../../websocket/events.js";

export function buildFollowHandler({db, services, websocket}) {
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

        await websocket.notifier.notify(EVENTS.FOLLOW, {
            displayName: event.user_name
        });

        console.log(`Twitch ALert: ${event.user_name} Followed!`);
        websocket.notifier.notify(EVENTS.TWITCH.ALERTS.FOLLOW, event);
    }

    return handler;
}