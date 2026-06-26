import { describe, it, expect, beforeEach, vi } from "vitest";
import { UserRepository } from "../server/database/userRepository.js"


let mockPool;
let repository;

beforeEach(()=> {
    mockPool = {
        execute: vi.fn()
    };

    repository = new UserRepository(mockPool);
});


describe("createBroadcaster", () => {
    it("should create a broadcaster and return the inserted id", async()=> {
        mockPool.execute.mockResolvedValue([
            {insertId: 10}
        ]);
        
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
        
        const result = await repository.createBroadcaster(broadcaster);
        
        expect(result).toBe(10);
        
        expect(mockPool.execute).toHaveBeenCalled();
    })
})

// TODO: updateBroadcaster
describe("updateBroadcaster",()=>{
    it("update broadcaster and return the updated id", async()=>{
        mockPool.execute.mockResolvedValue([
            {affectedRows: 1}
        ])

        const twitchUser = {
            twitchId: 12345678,
            login: "mctesterson",
            displayName: "Test McTesterson",
        };

        const token = {
            accessToken: "1234-abcd",
            refreshToken: "refresh-token",
            expiresIn: 3600
        };

        const result = await repository.updateBroadcaster({twitchUser, token});

        expect(mockPool.execute).toHaveBeenCalledWith(expect.stringContaining("UPDATE twitch_users"),[
           12345678, "mctesterson", "Test McTesterson", "1234-abcd", "refresh-token", 3600
        ])
    })
});


describe("updateToken", () => {
    it("should update the user's access and refresh tokens", async ()=> {
        mockPool.execute.mockResolvedValue([
            { affectedRows: 1 }
        ]);

        const token = {
            accessToken: "new_access",
            refreshToken: "refresh_new",
            expiresIn: 3600
        };

        const result = await repository.updateToken(10, token);

        expect(mockPool.execute).toHaveBeenCalledWith(expect.stringContaining("UPDATE twitch_users"), [
            "new_access",
            "refresh_new",
            3600,
            10
        ]);

        expect(result).toBe(true);
    })

})
