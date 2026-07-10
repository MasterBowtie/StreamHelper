import { buildAuthRouter } from "../routers/authRouter.js";
import { buildMainRouter } from "../routers/mainRouter.js";
import { buildTwitchRouter } from "../routers/twitchRouter.js";

export function buildRouters({twitch, db, events, services}) {
    const authRouter = buildAuthRouter({
        twitch,
        db,
        events
    })

    const twitchRouter = buildTwitchRouter({
        authRouter
    });

    const mainRouter = buildMainRouter();

    return {
        authRouter,
        twitchRouter,
        mainRouter
    }
}