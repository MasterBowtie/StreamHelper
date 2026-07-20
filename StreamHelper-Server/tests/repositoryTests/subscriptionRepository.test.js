import { describe, it, expect, beforeEach, vi } from "vitest";
import { SubscriptionRepository } from "../../server/database/subscriptionRepository.js";

let mockPool;
let repository;

beforeEach(()=>{
    mockPool = {
        execute: vi.fn()
    }

    repository = new SubscriptionRepository(mockPool);
});

describe("addSubscriber", ()=>{
    it("add a new subscriber to pool", async()=>{
        mockPool.execute.mockResolvedValue([
            {insertId: 4}
        ]);

        const result = await repository.addSubscriber({
            twitchId: 123456,
            eventId: 8424,
            months: 6,
            tier: "1000",
            isGift: false,
            giftedBy: null,
        });

        expect(mockPool.execute).toHaveBeenCalled();
        expect(result).toBe(4);
    })
});

describe("getSubscriberById", ()=>{
    it("get the subscriber by their twitch id", async()=>{
        mockPool.execute.mockResolvedValue([
            [{
                twitch_id: 1235
            }]
        ]);

        const result = await repository.getSubscriberById(1235);

        expect(mockPool.execute).toHaveBeenCalled();
        expect(result.twitch_id).toBe(1235);
        expect(result.display_name).toBeUndefined();
    });
    
    it("return null when no subscriber is found with twitch id", async()=>{
        mockPool.execute.mockResolvedValue([
            []
        ]);

        const result = await repository.getSubscriberById(1235);

        expect(mockPool.execute).toHaveBeenCalled();
        expect(result).toBeNull();

    });

});

describe("getSubscribers", ()=>{
    it("get all current subscribers", async()=>{
        mockPool.execute.mockResolvedValue([
            [
                {twitch_id: 1},
                {twitch_id: 2},
                {twitch_id: 3},
            ]
        ]);

        const rows = await repository.getSubscribers();

        expect(mockPool.execute).toHaveBeenCalled();
        expect(rows.length).toBe(3);
        expect(rows[2].twitch_id).toBe(3);
    });

    it("get all subscribers by stream id", async()=>{
        mockPool.execute.mockResolvedValue([
            [
                {twitch_id: 4},
                {twitch_id: 5},
                {twitch_id: 6},
                {twitch_id: 7},
            ]
        ]);

        const rows = await repository.getSubscribers(1);

        expect(mockPool.execute).toHaveBeenCalled();
        expect(rows.length).toBe(4);
        expect(rows[2].twitch_id).toBe(6);
    })
});

describe("updateSubscriber", ()=>{
    it("update subscriber with all values", async()=>{
        mockPool.execute.mockResolvedValue([
            {affectedRows: 1}
        ])

        const result = await repository.updateSubscriber({
            twitchId: 4,
            eventId: 15,
            tier: "1000",
            months: 6,
            isGift: true,
            giftedBy: 234,
            isSubscribed: true,
            verified: "TODAY"
        });
        
        expect(mockPool.execute).toHaveBeenCalled();
        expect(result).toBe(true);
    });

    it("throw error on bad twitchId", async()=>{
        await expect(repository.updateSubscriber())
            .rejects.toThrow("Cannot destructure property 'twitchId' of 'undefined' as it is undefined.");

        await expect(repository.updateSubscriber({eventId: 5}))
            .rejects.toThrow("updateSubscriber(): Invalid TwitchId");

        await expect(repository.updateSubscriber({twitchId: 0}))
            .rejects.toThrow("updateSubscriber(): Invalid TwitchId");

        await expect(repository.updateSubscriber({twitchId: null}))
            .rejects.toThrow("updateSubscriber(): Invalid TwitchId");
    });

    it("throw errors with missing values", async()=>{
        await expect(repository.updateSubscriber({twitchId: 1}))
            .rejects.toThrow("updateSubscriber() called with no fields to update.")
    });
});

describe("getSubscriberCount", ()=>{
    it("get count of all subscribers", async()=>{
        mockPool.execute.mockResolvedValue([
            [{subscriber_count: 5}]
        ]);

        const count = await repository.getSubscriberCount();

        expect(mockPool.execute).toHaveBeenCalled();
        expect(count).toBe(5);
    });

    it("get count of subscribers for stream", async()=>{
        mockPool.execute.mockResolvedValue([
            [{subscriber_count: 3}]
        ]);

        const count = await repository.getSubscriberCount(5);

        expect(mockPool.execute).toHaveBeenCalled();
        expect()
    })
});

describe("mostRecentSubscriber", ()=>{
    it("get the most recent subscriber", async()=>{
        mockPool.execute.mockResolvedValue([
            [{twitch_id: 10}]
        ]);

        const result = await repository.mostRecentSubscriber();

        expect(mockPool.execute).toHaveBeenCalled();
        expect(result.twitch_id).toBe(10);
    });

    it("get the most recent gifted subscriber", async()=>{
        mockPool.execute.mockResolvedValue([
            [{twitch_id: 12}]
        ]);

        const result = await repository.mostRecentSubscriber({isGift: true});

        expect(mockPool.execute).toHaveBeenCalled();
        expect(result.twitch_id).toBe(12);
    });

    it("get the most recent subscriber by tier", async()=>{
        mockPool.execute.mockResolvedValue([
            [{twitch_id: 12}]
        ]);

        const result = await repository.mostRecentSubscriber({tier: "1000"});

        expect(mockPool.execute).toHaveBeenCalled();
        expect(result.twitch_id).toBe(12);
    });

    it("get the most recent subscriber by stream", async()=>{
        mockPool.execute.mockResolvedValue([
            [{twitch_id: 12}]
        ]);

        const result = await repository.mostRecentSubscriber({streamId: 56});

        expect(mockPool.execute).toHaveBeenCalled();
        expect(result.twitch_id).toBe(12);
    });
});

describe("getTopGifters", ()=>{
    it("get 3 of the top gifters", async()=>{
        mockPool.execute.mockResolvedValue([
            [
                {twitch_id: 10},
                {twitch_id: 11},
                {twitch_id: 12},
            ]
        ]);

        const result = await repository.getTopGifters();

        expect(mockPool.execute).toHaveBeenCalled();
        expect(result.length).toBe(3);
        expect(result[0].twitch_id).toBe(10);
    });

    it("get 3 of the top gifters with values", async()=>{
        mockPool.execute.mockResolvedValue([
            [
                {twitch_id: 10},
            ]
        ]);

        const result = await repository.getTopGifters({streamId: 1, tier: "1000", limit: 1});

        expect(mockPool.execute).toHaveBeenCalled();
        expect(result.length).toBe(1);
        expect(result[0].twitch_id).toBe(10);
    });

    it("throw error with bad limit value", async()=>{
       await expect(repository.getTopGifters({limit: 0}))
            .rejects.toThrow("getTopGifters(): Invalid limit");

        await expect(repository.getTopGifters({limit: null}))
            .rejects.toThrow("getTopGifters(): Invalid limit");

        await expect(repository.getTopGifters({limit: -1}))
            .rejects.toThrow("getTopGifters(): Invalid limit");

        await expect(repository.getTopGifters({limit: 3.6}))
            .rejects.toThrow("getTopGifters(): Invalid limit");

        await expect(repository.getTopGifters({limit: "3"}))
            .rejects.toThrow("getTopGifters(): Invalid limit");
    });
});