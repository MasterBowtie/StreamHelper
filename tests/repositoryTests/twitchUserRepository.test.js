import { describe, it, expect, beforeEach, vi } from "vitest";
import { TwitchUserRepository } from "../../server/database/twitchUserRepository.js"

let mockPool;
let repository;

beforeEach(()=> {
    mockPool = {
        execute: vi.fn()
    };

    repository = new TwitchUserRepository(mockPool);
});

describe('getBroadcaster', ()=>{
    it("fetch broadcaster from the db", async()=>{
        mockPool.execute.mockResolvedValue([
            [{   
                id: 1,
                twitch_id: 123456789,
                login: "mctesterson",
                display_name: "Test McTesterson",
                access_token: "1234-abcd",
                refresh_token: "refresh-to"
            }]
        ])

        const broadcaster = await repository.getBroadcaster();

        expect(mockPool.execute).toHaveBeenCalled();
        expect(broadcaster.id).toBe(1)

    })

    it("handle a fail when no broadcaster is found", async()=>{
        mockPool.execute.mockResolvedValue([
            []
        ]);
        const broadcaster = await repository.getBroadcaster();

        expect(mockPool.execute).toHaveBeenCalled();
        expect(broadcaster).toBe(null);
    })
})

describe("updateBroadcaster", () => {
    const broadcaster = {
        twitchUser: {
            twitchId: "test_mcTesterson",
            login: "mctesterson",
            displayName: "Test McTesterson",
        },
        token: {
            accessToken: "1234-abcd",
            refreshToken: "refresh-token",
            expiresIn: 1234567
        }
    };
    it("create a broadcaster when one is not found", async()=>{
        mockPool.execute.mockResolvedValueOnce([
            []
        ]).mockResolvedValueOnce([
            {
                affectedRows: 1
            }
        ]);

        

        const result = await repository.updateBroadcaster(broadcaster);

        expect(mockPool.execute).toHaveBeenCalledTimes(2);
        expect(result).toBe(true);
    });

    it("update a broadcaster when it is found", async()=>{
                mockPool.execute.mockResolvedValueOnce([
            [{   
                id: 1,
                twitch_id: 123456789,
                login: "mctesterson",
                display_name: "Test McTesterson",
                access_token: "old-and-broken",
                refresh_token: "broken-and-old"
            }]
        ]).mockResolvedValueOnce([
            {
                affectedRows: 1
            }
        ]);

        const result = await repository.updateBroadcaster(broadcaster);

        expect(mockPool.execute).toHaveBeenCalledTimes(2);
        expect(result).toBe(true);
    })
});


describe("updateToken", () => {
    it("should update the broadcaster's access and refresh tokens", async ()=> {
        mockPool.execute.mockResolvedValue([
            { affectedRows: 1 }
        ]);

        const token = {
            accessToken: "new_access",
            refreshToken: "refresh_new",
            expiresIn: 3600
        };

        const result = await repository.updateToken(token);

        expect(mockPool.execute).toHaveBeenCalledWith(expect.stringContaining("UPDATE twitch_users"), [
            "new_access",
            "refresh_new",
            3600
        ]);

        expect(result).toBe(true);
    })

})

describe("findByTwitchId", ()=>{
    it("find a twitch with the given id", async()=>{
        mockPool.execute.mockResolvedValue([
            [{   
                id: 1234,
                twitch_id: 987654321,
                login: "mctesterson",
                display_name: "Test McTesterson",
                access_token: "1234-abcd",
                refresh_token: "refresh-to"
            }]
        ]);

        const user = await repository.findByTwitchId(987654321);

        expect(mockPool.execute).toHaveBeenCalled();
        expect(user.id).toBe(1234);
    });

    it("unable to find twitch user by id", async()=>{
        mockPool.execute.mockResolvedValue([
            []
        ]); 

        const user = await repository.findByTwitchId(12);

        expect(mockPool.execute).toHaveBeenCalled();
        expect(user).toBeNull();
    })

})

describe("createTwitchUser", ()=>{
    it("creates a new twitch user", async()=>{
        const user = {
            twitchId: 1234,
            login: "sampleuser",
            displayName: "Best Sample User"
        };

        mockPool.execute.mockResolvedValue([
            {
                insertId: 8
            }
        ]);

        const result = await repository.createTwitchUser({twitchUser: user});

        expect(mockPool.execute).toHaveBeenCalled();
        expect(result).toBe(8);
    });
});

describe("updateIdentity", ()=>{
    it("updates the display name of the given twitch id", async()=>{
        mockPool.execute.mockResolvedValue([
            { affectedRows: 1 }
        ]);

        const user = {twitchId: 1234, displayName: "New Lame Name"}
        const result = await repository.updateIdentity(user);

        expect(mockPool.execute).toHaveBeenCalled();
        expect(result).toBe(true);
    })
})