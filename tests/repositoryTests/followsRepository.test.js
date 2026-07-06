import { describe, it, expect, beforeEach, vi } from "vitest";
import { FollowsRepository } from "../../server/database/followsRepository.js";

let mockPool;
let repository;

beforeEach(()=>{
    mockPool = {
        execute: vi.fn()
    };

    repository = new FollowsRepository(mockPool);
});

describe("createFollow", ()=>{
    it("create and insert a new follower", async()=>{
        const follower = {
            twitchId: 1234,
            eventId: 987654321
        }

        mockPool.execute.mockResolvedValue([
            {insertId: 68}
        ]);

        const result = await repository.createFollower(follower);

        expect(mockPool.execute).toHaveBeenCalled();
        expect(result).toBe(68);
    });
});

describe("findByTwitchId", ()=>{
    it("find and return twitch follower by using twitch id", async()=>{
        mockPool.execute.mockResolvedValue([
            [{twitch_id: 2, display_name: "Test McTesterson", occurred_at: "Tomorrow"}]
        ]);

        const results = await repository.findByTwitchId(2);

        expect(mockPool.execute).toHaveBeenCalled();
        expect(results.display_name).toBe("Test McTesterson");
    });

    it("unable to find a follower by using the twitch id", async()=>{
        mockPool.execute.mockResolvedValue([
            []
        ]);
        const results = await repository.findByTwitchId(2);

        expect(mockPool.execute).toHaveBeenCalled();
        expect(results).toBeNull();
    });
});

describe("getFollowers", ()=>{
    it("get all followers that are currently following", async()=>{
        mockPool.execute.mockResolvedValue([
            [{twitch_id: 2}, {twitch_id: 3}, {twitch_id: 4}]
        ]);

        const rows = await repository.getFollowers();

        expect(mockPool.execute).toHaveBeenCalled();
        expect(rows.length).toBe(3);
    });

    it("get all followers that are currently not following", async()=>{
        mockPool.execute.mockResolvedValue([
            [{twitch_id: 2}, {twitch_id: 3}, {twitch_id: 4}]
        ]);

        const rows = await repository.getFollowers({streamId: 1});

        expect(mockPool.execute).toHaveBeenCalled();
        expect(rows.length).toBe(3);
    });

    it("get all followers that are currently not following", async()=>{
        mockPool.execute.mockResolvedValue([
            [{twitch_id: 2}, {twitch_id: 3}, {twitch_id: 4}]
        ]);

        const rows = await repository.getFollowers({isFollowing: false});

        expect(mockPool.execute).toHaveBeenCalled();
        expect(rows.length).toBe(3);
    });
})

describe("getMostRecentFollower", ()=>{
    it("gets the most recent follower", async()=>{
        mockPool.execute.mockResolvedValue([
            [{twitch_id: 5}]
        ]);

        const follower = await repository.getMostRecentFollower();

        expect(mockPool.execute).toHaveBeenCalled();
        expect(follower.twitch_id).toBe(5);
    });
});

describe("gainedFollowers", ()=>{
    it("return the current count of total followers", async()=>{
        mockPool.execute.mockResolvedValue([
            [{follower_count: 2}]
        ]);
        const f_count = await repository.gainedFollowers();

        expect(mockPool.execute).toHaveBeenCalled();
        expect(f_count).toBe(2);
    });

    it("return the current count of unfollows", async()=>{
        mockPool.execute.mockResolvedValue([
            [{follower_count: 5}]
        ]);

        const f_count = await repository.gainedFollowers({isFollowing: false});

        expect(mockPool.execute).toHaveBeenCalled();
        expect(f_count).toBe(5);
    });

    it("return the amount of gain follower per stream id", async()=>{
        mockPool.execute.mockResolvedValue([
            [{follower_count: 2}]
        ]);

        const f_count = await repository.gainedFollowers({streamId: 2});

        expect(mockPool.execute).toHaveBeenCalled();
        expect(f_count).toBe(2);
    })
});

describe("updateFollower", ()=>{
    it("update a follower", async()=>{
        mockPool.execute.mockResolvedValue([
            {affectedRows: 1}
        ]);

        const result = await repository.updateFollower({twitchId: 234, eventId: 9, verify: "today", isFollowing: true});

        expect(mockPool.execute).toHaveBeenCalled();
        expect(result).toBe(true);
    });

    it("throws an error when nothing is passed in", async()=>{
        await expect(repository.updateFollower())
        .rejects.toThrow("updateFollower(): Called with no fields to update.");
    })
})