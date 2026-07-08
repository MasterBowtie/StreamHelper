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

beforeEach(()=>{
    eventRepo = {
        createEvent: vi.fn()
    }
    streamRepo = {
        findActive: vi.fn()
    }
    
    logger = buildEventLogger({
        eventRepository: eventRepo,
        streamRepository: streamRepo,
    });
    
    dispatcher = buildEventDispatcher({eventLogger: logger});
    vi.clearAllMocks();
});

describe("Logger", ()=>{
    it("logs and event", async()=>{
        streamRepo.findActive.mockResolvedValue([
            {stream_id: 5}
        ]);
        await logger(json_streamonline);

        expect(streamRepo.findActive).toHaveBeenCalled();
        expect(eventRepo.createEvent).toHaveBeenCalled();
    })
})

describe("Dispatch", ()=>{
    it("warn for unhandled eventSub", async()=>{
        streamRepo.findActive.mockResolvedValue([
            {stream_id: 5}
        ])
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(()=>{});

        await dispatcher.dispatch(json_badEvent);

        expect(warnSpy).toHaveBeenCalledWith("Unhandled EventSub event:", "bad.event");
    });

    it("register a handler", async()=>{
        streamRepo.findActive.mockResolvedValue([
            {stream_id: 5}
        ]);
        const mockHandler = vi.fn();

        dispatcher.registerHandler("bad.event", mockHandler);
        await dispatcher.dispatch(json_badEvent);

        expect(mockHandler).toHaveBeenCalled();
    });
});




