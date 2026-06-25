import { Router } from "express";
import { DEBUG, MANIFEST } from "../../index.js";
import { buildAuthRouter } from "./authRouter.js";
import dotenv from "dotenv";

function requireAuth(req, res, next) {
    if (!req.session?.passport?.user) {
        return res.redirect("/twitch/auth/login");
    }

    next();
}

function buildTwitchRouter({authRouter}) {
    const router = Router();

    // Public auth Routes
    router.use("/auth", authRouter);

    // Protected routes
    router.use(requireAuth);
    // router.use('/eventsub', eventSubRouter);
    
    return router;
}

export { buildTwitchRouter }