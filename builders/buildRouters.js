import { buildAuthRouter } from "../routers/authRouter.js";
import { buildMainRouter } from "../routers/mainRouter.js";
import { buildSettingsRouter } from "../routers/settingsRouter.js";
import { buildTwitchRouter } from "../routers/twitchRouter.js";

export function buildRouters(components) {
    const authRouter = buildAuthRouter(components)

    const twitchRouter = buildTwitchRouter(components, authRouter);

    const settingsRouter = buildSettingsRouter(components);

    const mainRouter = buildMainRouter(components);

    return {
        authRouter,
        twitchRouter,
        settingsRouter,
        mainRouter,
    }
}