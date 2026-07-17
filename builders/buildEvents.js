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
            return false
        }

        await eventSubService.start();

        await eventSubService.registerSubscriptions(broadcaster);

        return true;
    }

    return {
        eventLogger,
        eventDispatcher,
        eventSubService
    };
}