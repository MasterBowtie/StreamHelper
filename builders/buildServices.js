import { buildTwitchUserService } from "../services/twitchUserService.js";

export function buildServices({db}) {
    const twitchUserService = buildTwitchUserService({db});


    return {
        twitchUserService
    }
}