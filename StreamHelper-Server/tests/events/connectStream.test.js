import { describe, it, expect, vi, afterEach, beforeEach } from "vitest"; 
import { buildEventDispatcher } from "../../events/eventDispatcher.js";
import { buildStreamOnlineHandler, buildStreamOfflineHandler } from "../../events/eventHandlers/streamConnect.js";
import json_streamonline from "../fixtures/json_streamonline.js";
import json_streamoffline from "../fixtures/json_streamoffline.js";
import json_badEvent from "../fixtures/json_badEvent.js";

let components;

beforeEach(()=> {
    components = {
        twitch: {
            twitchApiClient: {
                getStream: vi.fn(),
                }
            },
        websocket: {
            notifier: {
                notify: vi.fn()
            },
        },
        db: {
            streamRepository: {
                findActive: vi.fn(),
                startStream: vi.fn(),
                endStream: vi.fn(),
                getLatest: vi.fn(),
            }
        }
    }
})


describe("StreamOnlineHandler", ()=> {
    it("Save to DB when a new stream starts", async()=>{
        components.db.streamRepository.startStream.mockResolvedValue(42);
        components.db.streamRepository.findActive.mockResolvedValue(null);

        const onlineHandler = buildStreamOnlineHandler(components);
        
        await onlineHandler(json_streamonline);

        expect(components.db.streamRepository.findActive).toHaveBeenCalled();
        expect(components.db.streamRepository.startStream).toHaveBeenCalled();
    })

    it("handle an active Stream in DB", async()=>{
        components.db.streamRepository.startStream.mockResolvedValue(42),
        components.db.streamRepository.findActive.mockResolvedValue({id: 42, started_at: "2026-06-26T6:30:00Z"})
        
        const onlineHandler = buildStreamOnlineHandler(components);
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(()=>{});

        await onlineHandler(json_streamonline);

        expect(components.db.streamRepository.findActive).toHaveBeenCalled()
        expect(warnSpy).toHaveBeenCalledWith("There seems to already be a stream running");
    })
})

describe("StreamOfflineHandler", ()=> {
    it("successfully end stream and log stream duration", async()=>{
        components.db.streamRepository.endStream.mockResolvedValue(true),
        components.db.streamRepository.findActive.mockResolvedValue({id: 42, started_at: "2026-06-26T6:30:00Z"}),
        components.db.streamRepository.getLatest.mockResolvedValue({id: 42, started_at: "2026-06-26T6:30:00Z", end_at: "2026-06-26T8:30:00Z"})
        
        const offlineHandler = buildStreamOfflineHandler(components);
        const logSpy = vi.spyOn(console, "log").mockImplementation(()=>{});

        await offlineHandler(json_streamonline);

        expect(components.db.streamRepository.findActive).toHaveBeenCalled()
        expect(components.db.streamRepository.endStream).toHaveBeenCalled()
        expect(components.db.streamRepository.getLatest).toHaveBeenCalled()
        expect(logSpy).toHaveBeenCalledWith("Steam Offline: Thanks for watching!");
    })
})

