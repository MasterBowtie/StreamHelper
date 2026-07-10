import { buildEventDispatcher } from "../events/eventDispatcher.js";
import { buildEventLogger } from "../events/eventLogger.js";
import { buildEventSubService } from "../twitch/eventSubService.js";


export function buildEvents({twitch, db}) {
    const eventLogger = buildEventLogger({
        eventRepository: db.eventRepository,
        streamRepository: db.streamRepository
    });

    const eventDispatcher = buildEventDispatcher({eventLogger});

    const eventSubService = buildEventSubService({twitch, eventDispatcher});

    return {
        eventLogger,
        eventDispatcher,
        eventSubService
    };
}