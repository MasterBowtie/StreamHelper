import { buildTwitchUserService } from "../events/eventHandlers/twitchUserService.js";

export function buildServices({db}) {
    const twitchUserService = buildTwitchUserService({twitchUserRepository: db.twitchUserRepository});


    return {
        twitchUserService
    }
}