import { describe, it, expect, beforeEach, vi } from "vitest";
import { RaidRepository } from "../../server/database/raidRepository.js";

let mockPool;
let repository;

beforeEach(()=>{
    mockPool = {
        execute: vi.fn()
    }

    repository = new RaidRepository(mockPool);
});

describe("createRaid", ()=>{
    it("create a new raid", async()=>{
        mockPool.execute.mockResolvedValue([
            {insertId: 9}
        ]);

        const result = await repository.createRaid({
            eventId: 4,
            viewerCount: 10,
            raiderId: 12345
        });

        expect(mockPool.execute).toHaveBeenCalled();
        expect(result).toBe(9);
    });
});

describe("getMostRecentRaid", ()=>{
    it("get the most recent raid", async()=>{
        mockPool.execute.mockResolvedValue([
            [{twitch_id: 19}]
        ]);

        const result = await repository.getMostRecentRaid();

        expect(mockPool.execute).toHaveBeenCalled();
        expect(result.twitch_id).toBe(19);
    });

    it("get most recent raid from stream", async()=>{
        mockPool.execute.mockResolvedValue([
            [{twitch_id: 23}]
        ]);

        const result = await repository.getMostRecentRaid(3);

        expect(mockPool.execute).toHaveBeenCalled();
        expect(result.twitch_id).toBe(23);
    })
});

describe("getRaidCount", ()=>{
    it("get count of total raids", async()=>{
        mockPool.execute.mockResolvedValue([
            [{raid_count: 2}]
        ]);

        const count = await repository.getRaidCount();

        expect(mockPool.execute).toHaveBeenCalled();
        expect(count).toBe(2);
    });

    it("get count of raids from a stream", async()=>{
        mockPool.execute.mockResolvedValue([
            [{raid_count: 4}]
        ]);

        const count = await repository.getRaidCount(5);

        expect(mockPool.execute).toHaveBeenCalled();
        expect(count).toBe(4);
    })
});

describe("getRaiderStats", ()=>{
    it("get the raider without inputting a metric", async()=>{
        mockPool.execute.mockResolvedValue([
            [
                {raider_id: 4, display_name: "McTesterson", value: 8},
                {raider_id: 6, display_name: "McLamerson", value: 12},
                {raider_id: 9, display_name: "McAwesome", value: 189},
            ]
        ]);

        const raiders = await repository.getRaiderStats();

        expect(mockPool.execute).toHaveBeenCalled();
        expect(raiders[0].raider_id).toBe(4);
    });

    it("get the raider with a metric", async()=>{
        mockPool.execute.mockResolvedValue([
            [
                {raider_id: 4, display_name: "McTesterson", value: 7},
                {raider_id: 6, display_name: "McLamerson", value: 11},
                {raider_id: 9, display_name: "McAwesome", value: 190},
            ]
        ]);

        const raiders = await repository.getRaiderStats({metric: "count"});

        expect(mockPool.execute).toHaveBeenCalled();
        expect(raiders[0].value).toBe(7);
    });

    it("get the raider with a metric", async()=>{
        mockPool.execute.mockResolvedValue([
            [
                {raider_id: 4, display_name: "McTesterson", value: 7},
                {raider_id: 6, display_name: "McLamerson", value: 11},
                {raider_id: 9, display_name: "McAwesome", value: 190},
            ]
        ]);

        const raiders = await repository.getRaiderStats({metric: "count"});

        expect(mockPool.execute).toHaveBeenCalled();
        expect(raiders[0].value).toBe(7);
    });

    it("throw error with a bad raider metric", async()=>{
        await expect(repository.getRaiderStats({metric: "bad_metric"}))
            .rejects.toThrow("getRaiderStats(): Invalid metric");
    })

});