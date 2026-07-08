import { describe, it, expect, beforeEach, vi } from "vitest";
import json_channelfollow from "../fixtures/json_channelfollow.js";
import { buildFollowHandler } from "../../server/events/eventHandlers/followHandler.js";

let handler;
let followRepo;
let userRepo;


beforeEach(()=>{
    followRepo = {
        createFollower: vi.fn(),
        findByTwitchId: vi.fn(),
        getFollowers: vi.fn(),
        getMostRecentFollower: vi.fn(),
        gainedFollowers: vi.fn(),
        updateFollower: vi.fn(),
    }

    userRepo = {
        findByTwitchId: vi.fn(),
        createTwitchUser: vi.fn(),
        updateIdentity: vi.fn(),
    }

    handler = buildFollowHandler({followerRepository: followRepo, twitchUserRepository: userRepo});
});

describe("FollowerHandler", ()=>{
    it("initial test", async()=>{
        const logSpy = vi.spyOn(console, "log").mockImplementation(()=>{});

        handler(json_channelfollow.payload.event);

        expect(logSpy).toHaveBeenCalledWith("Cool_User followed");
    })
})
