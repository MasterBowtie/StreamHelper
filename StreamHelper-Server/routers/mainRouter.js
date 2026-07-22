import { Router } from "express";

export function buildMainRouter({twitch, websocket}) {
    const router = Router();

    router.get("/setup-complete", (req, res) =>{
        res.send("Twitch setup complete. You may close this window")
    })
    
    router.get("/test", (req, res) => {
        websocket.notifier.notify("test");
    })

    return router;
}