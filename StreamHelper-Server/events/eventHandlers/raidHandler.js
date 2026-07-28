import { EVENTS } from "../../websocket/events.js";

export function buildRaidHandler({db, services, websocket}) {
    async function handler(event, eventId) {
        const raider = {
            user_id: event.from_broadcaster_user_id,
            login: event.from_broadcaster_user_login,
            user_name: event.from_broadcaster_user_name,
        }
        services.twitchUserService(raider);

        db.raidRepository.createRaid({eventId, raiderId: raider.user_id, viewerCount:event.viewers})
    
        websocket.notifier.notify(EVENTS.TWITCH.ALERTS.RAID, event)
    }

    return handler;
}