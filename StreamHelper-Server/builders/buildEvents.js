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
    
    const eventSubService = buildEventSubService({twitch, eventDispatcher});
    
    const handlers = buildHandlers({db, twitch, websocket, services, eventDispatcher})

    async function initialize(broadcaster) {
        if (!broadcaster) {

            twitch.setEventSubStatus({
                connected: false,
                reason: "No broadcaster"
            })
            return;
        }

        await eventSubService.start();

        await eventSubService.registerSubscriptions(broadcaster);

        twitch.setEventSubStatus({connected: true});
    }

    return {
        initialize,
        eventLogger,
        eventDispatcher,
        eventSubService
    };
}