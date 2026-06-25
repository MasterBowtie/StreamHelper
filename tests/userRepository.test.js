import { describe, it, expect, beforeEach, vi } from "vitest";
import { UserRepository } from "../server/database/userRepository.js"

describe("UserRepository", () => {
    let mockPool;
    let repository;

    beforeEach(()=> {
        mockPool = {
            execute: vi.fn()
        };

        repository = new UserRepository(mockPool);
    });

    describe("createBroadcaster()", () => {
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
                    expiresAt: 1234567
                }
            };

            const result = await repository.createBroadcaster(broadcaster);

            expect(result).toBe(10);

            expect(mockPool.execute).toHaveBeenCalled();
        })
    })


    describe("updateToken()", () => {
        it("should update the user's access and refresh tokens", async ()=> {
            mockPool.execute.mockResolvedValue([
                { affectedRows: 1 }
            ]);

            const result = await repository.updateToken(10, "new_access", "refresh_new", 88797);

            expect(mockPool.execute).toHaveBeenCalledWith(expect.stringContaining("UPDATE twitch_users"), [
                "new_access",
                "refresh_new",
                88797,
                10
            ]);

            expect(result).toBe(true);
        })

    })
})