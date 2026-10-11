import { describe, it, expect, beforeEach, vi } from "vitest";
import json_channelfollow from "../fixtures/json_channelfollow.js";
import { buildFollowHandler } from "../../events/eventHandlers/followHandler.js";

let components;
let handler;

beforeEach(()=>{
    components = {
        twitch: {
            twitchApiClient: {
                getStream: vi.fn(),
                }
            },
        websocket: {
            notifier: {
                notify: vi.fn()
            },
        },
        db: {
            followerRepository: {
                updateFollower: vi.fn(),
                createFollowerByEvent: vi.fn(),
                findByTwitchId: vi.fn(),
            }
        },
        services: {
            twitchUserService: vi.fn(),
        }
    }

    handler = buildFollowHandler(components);
});

describe("FollowerHandler", ()=>{
    it("Create brand new follower", async()=>{
        components.db.followerRepository.findByTwitchId.mockResolvedValue(null);
        components.db.followerRepository.createFollowerByEvent.mockResolvedValue(2)
        
        await handler(json_channelfollow.payload.event);

        expect(components.services.twitchUserService).toHaveBeenCalled();
        expect(components.db.followerRepository.findByTwitchId).toHaveBeenCalled();
        expect(components.db.followerRepository.createFollowerByEvent).toHaveBeenCalled();
    });

    it("Update follower that previously unfollowed", async()=>{
        components.db.followerRepository.findByTwitchId.mockResolvedValue({
            twitch_id: 4,
            display_name: "Cool_User"
        });
        components.db.followerRepository.updateFollower.mockResolvedValue(true)
        
        await handler(json_channelfollow.payload.event);

        expect(components.services.twitchUserService).toHaveBeenCalled();
        expect(components.db.followerRepository.findByTwitchId).toHaveBeenCalled();
        expect(components.db.followerRepository.updateFollower).toHaveBeenCalled();
    });
});
