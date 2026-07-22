import { buildEventDispatcher } from "../events/eventDispatcher.js";
import { buildEventLogger } from "../events/eventLogger.js";
import { buildEventSubService } from "../events/eventSubService.js";
import { buildHandlers } from "./buildHandlers.js";


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
        
        // console.log("Event Init:", broadcaster);

        await eventSubService.start();

        await eventSubService.registerSubscriptions(broadcaster);
        
        await buildHandlers({db, twitch, websocket, services, eventDispatcher})
        
        twitch.setEventSubStatus({connected: true});

        console.log("EventSub Initialized...");
    }

    return {
        initialize,
        eventLogger,
        eventDispatcher,
        eventSubService
    };
}