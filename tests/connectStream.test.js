import { describe, it, expect, vi, afterEach, beforeEach } from "vitest"; 
import { buildEventDispatcher } from "../server/twitch/eventDispatcher.js";
import { buildStreamOnlineHandler, buildStreamOfflineHandler } from "../server/twitch/eventHandlers/streamConnect.js";
import json_streamonline from "./fixtures/json_streamonline.js";
import json_streamoffline from "./fixtures/json_streamoffline.js";
import json_badEvent from "./fixtures/json_badEvent.js";


const fakeApiClient = {
    getStream: vi.fn().mockResolvedValue({
        id: "stream-id",
        user_id: "12345678",
        user_login: "mctesterson",
        user_name: "Test McTesterson",
        game_name: "Just Chatting",
        title: "Testing my stream",
        viewer_count: 42,
        started_at: "2026-06-26T8:30:00Z"
    })
}


describe("StreamOnlineHandler", ()=> {
    it("Save to DB when a new stream starts", async()=>{
        const fakeRepository = {
            startStream: vi.fn().mockResolvedValue(42),
            findActive: vi.fn().mockResolvedValue(null)
        }
        const onlineHandler = buildStreamOnlineHandler({twitchApiClient: fakeApiClient, streamRepository: fakeRepository});
        
        await onlineHandler(json_streamonline);

        expect(fakeRepository.findActive).toHaveBeenCalled();
        expect(fakeRepository.startStream).toHaveBeenCalled();
    })

    it("handle an active Stream in DB", async()=>{
        const fakeRepository = {
            startStream: vi.fn().mockResolvedValue(42),
            findActive: vi.fn().mockResolvedValue({id: 42, started_at: "2026-06-26T6:30:00Z"})
        }
        const onlineHandler = buildStreamOnlineHandler({twitchApiClient: fakeApiClient, streamRepository: fakeRepository});
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(()=>{});

        await onlineHandler(json_streamonline);

        expect(fakeRepository.findActive).toHaveBeenCalled()
        expect(warnSpy).toHaveBeenCalledWith("There seems to already be a stream running");
    })
})

describe("StreamOfflineHandler", ()=> {
    it("successfully end stream and log stream duration", async()=>{
        const fakeRepository = {
            endStream: vi.fn().mockResolvedValue(true),
            findActive: vi.fn().mockResolvedValue({id: 42, started_at: "2026-06-26T6:30:00Z"}),
            getLatest: vi.fn().mockResolvedValue({id: 42, started_at: "2026-06-26T6:30:00Z", end_at: "2026-06-26T8:30:00Z"})
        }
        const offlineHandler = buildStreamOfflineHandler({twitchApiClient: fakeApiClient, streamRepository: fakeRepository});
        const logSpy = vi.spyOn(console, "log").mockImplementation(()=>{});

        await offlineHandler(json_streamonline);

        expect(fakeRepository.findActive).toHaveBeenCalled()
        expect(fakeRepository.endStream).toHaveBeenCalled()
        expect(fakeRepository.getLatest).toHaveBeenCalled()
        expect(logSpy).toHaveBeenCalledWith("Steam Offline: Thanks for watching!");
    })
})

