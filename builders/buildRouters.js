import { buildAuthRouter } from "../routers/authRouter.js";
import { buildMainRouter } from "../routers/mainRouter.js";
import { buildTwitchRouter } from "../routers/twitchRouter.js";

export function buildRouters(components) {
    const authRouter = buildAuthRouter(components)

    const twitchRouter = buildTwitchRouter(components, authRouter);

    const mainRouter = buildMainRouter(components);

    return {
        authRouter,
        twitchRouter,
        mainRouter
    }
}