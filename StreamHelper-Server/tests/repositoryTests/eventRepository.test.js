import { describe, it, expect, beforeEach, vi } from "vitest";
import { EventRepository } from "../../database/eventRepository";

let mockPool;
let repository;

beforeEach(()=>{
    mockPool = {
        execute: vi.fn()
    };

    repository = new EventRepository(mockPool);
});

describe("createEvent", ()=>{
    it("create and submit a new event", async()=>{
        const mockEvent = {
            id: "stream-event-id",
            eventType: "test.event",
            streamId: "12",
            occurredAt: "2026-06-26T18:00:00.000Z",
            metadata: {
                "message_id": "e9f4b8a1-1234-5678-9999-abcdef123456",
                "message_type": "notification",
                "message_timestamp": "2026-07-06T11:00:00.000Z",
                "subscription_type": "test.event",
                "subscription_version": "1"
            }
        }
        mockPool.execute.mockResolvedValue([
            {insertId: 68}
        ])

        const result = await repository.createEvent(mockEvent);

        expect(mockPool.execute).toHaveBeenCalled();
        expect(result).toBe(68);
    });
})

describe("getEventById", ()=>{
    it("get a event by id", async()=>{
        mockPool.execute.mockResolvedValue([
            [{
                event_id: 18,
                event_type: "event.test",
                stream_id: 12,
                twitch_id: null,
                occurred_at: "2026-07-06T11:00:00.000Z",
                create_at: "2026-07-06T11:00:00.000Z",
                meta_data: {
                    something: "Hello World"
                }
            }]
        ]);

        const result = await repository.getEventById(18);

        expect(mockPool.execute).toHaveBeenCalled();
        expect(result.event_id).toBe(18);
    });

    it("fail to get an event by id", async()=>{
        mockPool.execute.mockResolvedValue([
            []
        ]);

        const result = await repository.getEventById(18);

        expect(mockPool.execute).toHaveBeenCalled();
        expect(result).toBeNull();
    })
})

describe("getEvents", ()=> {
    it("returns an empty array when no conditions are given", async () => {
        const consoleError = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});

        const result = await repository.getEvents();

        expect(consoleError).toHaveBeenCalledWith(
            "getEvents(): No conditions were given"
        );

        expect(result).toEqual([]);
    });

    it("get events by type", async()=>{
        mockPool.execute.mockResolvedValue([
            [{id: 1}, {id:2}, {id:3}]
        ])

        const events = await repository.getEvents({eventType: "test"});

        expect(mockPool.execute).toHaveBeenCalled();
        expect(events.length).toBe(3);
    });

    it("get events by streamId", async()=>{
        mockPool.execute.mockResolvedValue([
            [{id: 1}, {id:2}, {id:3}]
        ]);

        const events = await repository.getEvents({streamId: 12});

        expect(mockPool.execute).toHaveBeenCalled();
        expect(events.length).toBe(3);
    })

    it("get events after startAt", async()=>{
        mockPool.execute.mockResolvedValue([
            [{id: 1}, {id:2}, {id:3}]
        ]);

        const events = await repository.getEvents({startAt: "2026-06-26T18:00:00.000Z"});

        expect(mockPool.execute).toHaveBeenCalled();
        expect(events.length).toBe(3);
    })

    it("get events after endAt", async()=>{
        mockPool.execute.mockResolvedValue([
            [{id: 1}, {id:2}, {id:3}]
        ]);

        const events = await repository.getEvents({endAt: "2026-06-26T18:00:00.000Z"});

        expect(mockPool.execute).toHaveBeenCalled();
        expect(events.length).toBe(3);
    })

    it("get a limit amount of events with conditions", async()=>{
        mockPool.execute.mockResolvedValue([
            [{id: 1}, {id:2}, {id:3}]
        ])

        const events = await repository.getEvents({eventType: "test", limit: 3});

        expect(mockPool.execute).toHaveBeenCalled();
        expect(events.length).toBe(3);
    })

    it("return empty array with bad limit param", async()=>{
        const consoleError = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});

        await repository.getEvents({eventType: "test", limit: "aaa"});

        expect(consoleError).toHaveBeenCalledWith("getEvents(): limit must be a positive integer");

        expect(await repository.getEvents({eventType: "test", limit: 0})).toEqual([])
            
        expect(await repository.getEvents({eventType: "test", limit: "abc"})).toEqual([])
            
        expect(await repository.getEvents({eventType: "test", limit: "5"})).toEqual([])

        expect(await repository.getEvents({eventType: "test", limit: null})).toEqual([])

        expect(await repository.getEvents({eventType: "test", limit: -1})).toEqual([])

        expect(await repository.getEvents({eventType: "test", limit: 5.5})).toEqual([])

        expect(await repository.getEvents({eventType: "test", limit: NaN})).toEqual([])

        expect(await repository.getEvents({eventType: "test", limit: isFinite})).toEqual([])
    })
})