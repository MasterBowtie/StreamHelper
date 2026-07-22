import { Router } from "express";

function buildTwitchRouter(components, authRouter, eventSubRouter) {
    const router = Router();

    router.get('/', (req, res)=> {
        res.send(components.twitch.getStatus());
    })
    // Public auth Routes
    router.use("/auth", authRouter);

    router.use('/eventSub', eventSubRouter);

    router.get("/status", (req, res) => {
        res.send(components.twitch.getStatus())
    })
    
    return router;
}

export { buildTwitchRouter }