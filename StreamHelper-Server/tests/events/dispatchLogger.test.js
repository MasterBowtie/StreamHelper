import { describe, it, expect, beforeEach, vi } from "vitest";
import { buildEventDispatcher } from "../../events/eventDispatcher.js";
import { buildEventLogger } from "../../events/eventLogger.js";

// Test messages
import json_badEvent from "../fixtures/json_badEvent.js";
import json_streamonline from "../fixtures/json_streamonline.js";

let dispatcher;
let logger;
let db;


beforeEach(()=> {
    db = {
        eventRepository: {
            createEvent: vi.fn(),
        },
        streamRepository: {
            findActive: vi.fn(),
        },
        twitchUserRepository: {
            createTwitchUser: vi.fn(),
            findByTwitchId: vi.fn(),
        }
    }

})

describe("Logger", ()=>{
    beforeEach(()=>{
        logger = buildEventLogger(db);
    });

    it("logs an event", async()=>{
        db.streamRepository.findActive.mockResolvedValue([
            {stream_id: 5}
        ]);
        db.eventRepository.createEvent.mockResolvedValue(5);
        
        const result = await logger(json_streamonline);

        expect(db.streamRepository.findActive).toHaveBeenCalled();
        expect(db.eventRepository.createEvent).toHaveBeenCalled();
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
        expect(logger).not.toHaveBeenCalled();
    });
});




