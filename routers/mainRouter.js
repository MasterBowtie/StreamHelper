import { Router } from "express";

export function buildMainRouter({twitch}) {
    const router = Router();

    router.get("/setup-complete", (req, res) =>{
        res.send("Twitch setup complete. You may close this window")
    })

    router.get("/status", (req, res) => {
        res.send(twitch.getStatus())
    }) 

    return router;
}