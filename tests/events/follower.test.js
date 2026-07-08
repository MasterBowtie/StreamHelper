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
    it("Create brand new follower", async()=>{
        userRepo.findByTwitchId.mockResolvedValue(null);
        userRepo.createTwitchUser.mockResolvedValue(4);
        followRepo.findByTwitchId.mockResolvedValue(null);
        followRepo.createFollower.mockResolvedValue(2)
        
        await handler(json_channelfollow.payload.event);

        expect(userRepo.findByTwitchId).toHaveBeenCalled();
        expect(userRepo.createTwitchUser).toHaveBeenCalled();
        expect(followRepo.findByTwitchId).toHaveBeenCalled();
        expect(followRepo.createFollower).toHaveBeenCalled();
    });

    it("Update follower identity", async()=>{
        userRepo.findByTwitchId.mockResolvedValue({
            twitch_id: 4,
            display_name: "McTesterson"
        });
        userRepo.updateIdentity.mockResolvedValue(true);
        followRepo.findByTwitchId.mockResolvedValue(null);
        followRepo.createFollower.mockResolvedValue(2)
        
        await handler(json_channelfollow.payload.event);

        expect(userRepo.findByTwitchId).toHaveBeenCalled();
        expect(userRepo.updateIdentity).toHaveBeenCalled();
        expect(followRepo.findByTwitchId).toHaveBeenCalled();
        expect(followRepo.createFollower).toHaveBeenCalled();
    });

    it("Update follower that previously unfollowed", async()=>{
        userRepo.findByTwitchId.mockResolvedValue({
            twitch_id: 4,
            display_name: "McTesterson"
        });
        userRepo.updateIdentity.mockResolvedValue(true);
        followRepo.findByTwitchId.mockResolvedValue({
            twitch_id: 4,
            display_name: "Cool_User"
        });
        followRepo.updateFollower.mockResolvedValue(true)
        
        await handler(json_channelfollow.payload.event);

        expect(userRepo.findByTwitchId).toHaveBeenCalled();
        expect(userRepo.updateIdentity).toHaveBeenCalled();
        expect(followRepo.findByTwitchId).toHaveBeenCalled();
        expect(followRepo.updateFollower).toHaveBeenCalled();
    });
});
