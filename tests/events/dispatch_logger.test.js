import { describe, it, expect, beforeEach, vi } from "vitest";
import { buildEventDispatcher } from "../../server/events/eventDispatcher.js";
import { buildEventLogger } from "../../server/events/eventHandlers/eventLogger.js";

// Test messages
import json_badEvent from "../fixtures/json_badEvent.js";
import json_streamonline from "../fixtures/json_streamonline.js";

let dispatcher;
let logger;
let eventRepo;
let streamRepo;

describe("Logger", ()=>{
    beforeEach(()=>{
        eventRepo = {
            createEvent: vi.fn()
        }
        streamRepo = {
            findActive: vi.fn()
        }

        logger = buildEventLogger({eventRepository: eventRepo, streamRepository: streamRepo})
    });

    it("logs and event", async()=>{
        streamRepo.findActive.mockResolvedValue([
            {stream_id: 5}
        ]);
        eventRepo.createEvent.mockResolvedValue(5);
        
        const result = await logger(json_streamonline);

        expect(streamRepo.findActive).toHaveBeenCalled();
        expect(eventRepo.createEvent).toHaveBeenCalled();
        expect(result).toBe(5);
    })
})


describe("Dispatch", ()=>{
    beforeEach(()=>{
        logger = vi.fn()
    
        dispatcher = buildEventDispatcher({eventLogger: logger});
        vi.clearAllMocks();
    })
    
    it("warn for unhandled eventSub", async()=>{
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(()=>{});

        await dispatcher.dispatch(json_badEvent);

        expect(warnSpy).toHaveBeenCalledWith("Unhandled EventSub event:", "bad.event");
    });

    it("register a persistent handler", async()=>{
        const mockHandler = vi.fn();

        dispatcher.registerHandler("bad.event", mockHandler, true);
        await dispatcher.dispatch(json_badEvent);

        expect(mockHandler).toHaveBeenCalled();
        expect(logger).toHaveBeenCalled();
    });

    it("register a ethereal handler", async()=>{
        const mockHandler = vi.fn();

        dispatcher.registerHandler("bad.event", mockHandler, false);
        await dispatcher.dispatch(json_badEvent);

        expect(mockHandler).toHaveBeenCalled();
        expect(logger).toHaveBeenCalledTimes(0);
    });
});




