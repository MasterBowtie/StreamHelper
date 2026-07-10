import { Router } from "express";

export function buildMainRouter() {
    const router = Router();

    router.get("/setup-complete", (req, res) =>{
        res.send("Twitch setup complete. You may close this window")
    })

    return router;
}