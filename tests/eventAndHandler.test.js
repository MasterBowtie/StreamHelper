import { describe, it, expect, vi, afterEach, beforeEach } from "vitest"; 
import { buildEventDispatcher } from "../server/twitch/eventDispatcher";
import { buildSteamOfflineHandler, buildSteamOnlineHandler } from "../server/twitch/eventHandlers/streamConnect";

function mockTwitchEvent(type) {
    return {
        "metadata": {
            "message_id": "e9f4b8a1-1234-5678-9999-abcdef123456",
            "message_type": "notification",
            "message_timestamp": "2026-06-26T18:30:00.000Z",
            "subscription_type": type,
            "subscription_version": "1"
        },
        "payload": {
            "subscription": {
                "id": "subscription-id",
                "status": "enabled",
                "type": type,
                "version": "1",
                "condition": {
                    "broadcaster_user_id": "12345678"
                },
                "transport": {
                    "method": "websocket",
                    "session_id": "session-id"
                },
                "created_at": "2026-06-26T18:00:00.000Z"
            },
            "event": {
                "id": "stream-event-id",
                "broadcaster_user_id": "12345678",
                "broadcaster_user_login": "mctesterson",
                "broadcaster_user_name": "Test McTesterson",
                "type": "live",
                "started_at": "2026-06-26T18:30:00.000Z"
            }
        }
    }
}

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

describe("EventDispatch", ()=>{
    const dispatch = buildEventDispatcher();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(()=>{});
    const logSpy = vi.spyOn(console, "log").mockImplementation(()=>{});

    it("dispatch handles unknown event", async ()=>{

        const message = mockTwitchEvent('unknown.event')
        await dispatch.dispatch(message);


        expect(warnSpy).toHaveBeenCalledWith("Unhandled EventSub event:", 'unknown.event');

        warnSpy.mockClear();
    })

    describe("StreamOnlineHandler", ()=> {
        dispatch.registerHandler('stream.online', buildSteamOnlineHandler({twitchApiClient: fakeApiClient}))
        it("calls and uses getStream from apiClient", async ()=>{
            await dispatch.dispatch(mockTwitchEvent("stream.online"));
            
            expect(fakeApiClient.getStream).toHaveBeenCalledWith("12345678")
        })
    })

    describe("StreamOfflineHandler", ()=> {
        dispatch.registerHandler("stream.offline", buildSteamOfflineHandler());

        it("logs the end of the stream", async()=>{
            logSpy.mockClear();
            await dispatch.dispatch(mockTwitchEvent("stream.offline"));

            expect(logSpy).toHaveBeenCalledWith("Steam Offline: Thanks for watching!")
        })

    })
})