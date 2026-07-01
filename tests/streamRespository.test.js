import { describe, it, expect, beforeEach, vi } from "vitest";
import { StreamRepository } from "../server/database/streamRepository";
import { create } from "express-handlebars";
import json_streamonline from "./fixtures/json_streamonline.js";

let mockPool;
let repository;

beforeEach(()=>{
    mockPool = { execute: vi.fn() };

    repository = new StreamRepository(mockPool);
})

describe("findId", ()=>{
    it("Find a stream with the given id", async()=>{
        mockPool.execute.mockResolvedValue([
            [{
                id: 42,
                start_at: "2026-06-26 18:30:00",
                end_at: "2026-06-26 22:15:42",
                create_at: "2026-06-26 18:30:00",
                updated_at: "2026-06-26 22:15:42"
            }]
        ])

        const stream = await repository.findById(42);

        expect(stream.id).toBe(42); 
    });

    it("When stream id is unable to be found", async()=>{
        mockPool.execute.mockResolvedValue([
            []
        ]);

        const stream = await repository.findById(42);

        expect(stream).toBeNull();
    });
}); 

describe("startStream", ()=>{
    it("creates a new stream with the given time stamp", async()=>{
        mockPool.execute.mockResolvedValue([
            {
                insertId: 42,
                affectedRows: 1
            }
        ])
        const event = json_streamonline.payload.event;
        const stream = await repository.startStream(event);

        expect(mockPool.execute).toHaveBeenCalled();
        expect(stream).toBe(42);
    });
});

describe("findActive", ()=>{
        it("Find an stream without an end_at", async()=>{
        mockPool.execute.mockResolvedValue([
            [{
                id: 42,
                start_at: "2026-06-26 18:30:00",
                create_at: "2026-06-26 18:30:00",
            }]
        ])

        const stream = await repository.findActive();

        expect(mockPool.execute).toHaveBeenCalled();
        expect(stream.id).toBe(42); 
    });

    it("When stream id is unable to be found", async()=>{
        mockPool.execute.mockResolvedValue([
            []
        ]);

        const stream = await repository.findActive(42);

        expect(stream).toBeNull();
    });
});

describe("endStream", ()=>{
    it("updates and logs stream end with the given id", async()=>{
        mockPool.execute.mockResolvedValue([
            {
                insertId: 42,
                affectedRows: 1
            }
        ])
        const event = json_streamonline.payload.event;
        const stream = await repository.endStream(42);

        expect(mockPool.execute).toHaveBeenCalled();
        expect(stream).toBe(true);
    });

    it("Returns false when an id is not found", async()=>{
        mockPool.execute.mockResolvedValue([
            {
                affectedRows: 0
            }
        ])

        const stream = await repository.endStream(42);
        expect(stream).toBe(false);
    });
});


describe("getLatest", ()=>{
    it("Grab the latest stream that happened", async()=>{
        mockPool.execute.mockResolvedValue([
            [{
                id: 42,
                start_at: "2026-06-26 18:30:00",
                end_at: "2026-06-26 22:15:42",
                create_at: "2026-06-26 18:30:00",
                updated_at: "2026-06-26 22:15:42"
            }]
        ])

        const stream = await repository.getLatest();

        expect(mockPool.execute).toHaveBeenCalled();
        expect(stream.id).toBe(42);
    })
}) 
// describe("updateStream", ()=>{}) 
