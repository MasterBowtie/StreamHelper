import { describe, it, expect, beforeEach, vi } from "vitest";
import json_channelfollow from "../fixtures/json_channelfollow.js";
import { buildFollowHandler } from "../../server/events/eventHandlers/followHandler.js";

let handler;
let followRepo;
let userService;


beforeEach(()=>{
    followRepo = {
        createFollower: vi.fn(),
        findByTwitchId: vi.fn(),
        updateFollower: vi.fn(),
    }

    userService = vi.fn()

    handler = buildFollowHandler({followerRepository: followRepo, twitchUserService: userService});
});

describe("FollowerHandler", ()=>{
    it("Create brand new follower", async()=>{
        followRepo.findByTwitchId.mockResolvedValue(null);
        followRepo.createFollower.mockResolvedValue(2)
        
        await handler(json_channelfollow.payload.event);

        expect(userService).toHaveBeenCalled();
        expect(followRepo.findByTwitchId).toHaveBeenCalled();
        expect(followRepo.createFollower).toHaveBeenCalled();
    });

    it("Update follower identity", async()=>{
        followRepo.findByTwitchId.mockResolvedValue(null);
        followRepo.createFollower.mockResolvedValue(2)
        
        await handler(json_channelfollow.payload.event);

        expect(userService).toHaveBeenCalled();
        expect(followRepo.findByTwitchId).toHaveBeenCalled();
        expect(followRepo.createFollower).toHaveBeenCalled();
    });

    it("Update follower that previously unfollowed", async()=>{
        followRepo.findByTwitchId.mockResolvedValue({
            twitch_id: 4,
            display_name: "Cool_User"
        });
        followRepo.updateFollower.mockResolvedValue(true)
        
        await handler(json_channelfollow.payload.event);

        expect(userService).toHaveBeenCalled();
        expect(followRepo.findByTwitchId).toHaveBeenCalled();
        expect(followRepo.updateFollower).toHaveBeenCalled();
    });
});
