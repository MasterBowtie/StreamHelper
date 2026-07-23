import { buildEventDispatcher } from "../events/eventDispatcher.js";
import { buildEventLogger } from "../events/eventLogger.js";
import { buildEventSubService } from "../events/eventSubService.js";
import { buildHandlers } from "./buildHandlers.js";
import { EVENTS } from "../websocket/events.js";


export function buildEvents({twitch, db, services, websocket}) {
    const eventLogger = buildEventLogger({
        eventRepository: db.eventRepository,
        streamRepository: db.streamRepository
    });

    const eventDispatcher = buildEventDispatcher({eventLogger});
    
    const eventSubService = buildEventSubService({twitch, websocket, eventDispatcher});
    
    
    async function initialize() {
        const broadcaster = await db.twitchUserRepository.getBroadcaster();

        if (!broadcaster) {
            twitch.setEventSubStatus({
                connected: false,
                message: "No broadcaster"
            })
            return;
        }

        await eventSubService.start();

        const result = await eventSubService.registerSubscriptions(broadcaster);
        if (!result.success) {
            console.warn("EventSub Error:", result.message)
            websocket.notifier.notify(EVENTS.ERRORS.EVENTSUB, result.message)
            return;
        }
        
        for (const sub of result.data) {
            if (sub.success) {
                console.log("EventSub Subscribed:", sub.data);
                websocket.notifier.notify(EVENTS.APP.EVENTSUB.SUBSCRIBED, sub.data);
            } else {
                console.warn("EventSub Error:", sub.message);
            }
        }
        
        await buildHandlers({db, twitch, websocket, services, eventDispatcher})
        
        twitch.setEventSubStatus({connected: true});

        console.log("EventSub Initialized...");
        websocket.notifier.notify(EVENTS.APP.EVENTSUB.READY);
    }

    return {
        initialize,
        eventLogger,
        eventDispatcher,
        eventSubService
    };
}