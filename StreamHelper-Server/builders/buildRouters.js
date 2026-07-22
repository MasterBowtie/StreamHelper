import { buildAuthRouter } from "../routers/twitch/authRouter.js";
import { buildMainRouter } from "../routers/mainRouter.js";
import { buildSettingsRouter } from "../routers/settingsRouter.js";
import { buildTwitchRouter } from "../routers/twitch/twitchRouter.js";
import { buildEventSubRouter } from "../routers/twitch/eventSubRouter.js";

export function buildRouters(components) {
    const authRouter = buildAuthRouter(components)

    const eventSubRouter = buildEventSubRouter(components);

    const twitchRouter = buildTwitchRouter(components, authRouter, eventSubRouter);

    const settingsRouter = buildSettingsRouter(components);

    const mainRouter = buildMainRouter(components);

    return {
        eventSubRouter,
        authRouter,
        twitchRouter,
        settingsRouter,
        mainRouter,
    }
}