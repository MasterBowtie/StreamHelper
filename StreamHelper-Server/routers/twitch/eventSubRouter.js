import { Router } from "express";

export function buildEventSubRouter({twitch, events, websocket}) {
    const router = Router();

    router.post("/stop", async (req, res) => {
        events.eventSubService.stop();
        res.json({
            eventSub: "stopped"
        })
    })

    router.post("/connect", async (req, res) =>{
        events.initialize();
        res.json({
            eventSub: "initializing"
        });

        websocket.notifier.notify("app.eventsub.initializing");
    })

    router.get("/status", (req, res) => {
        res.send(events.getStatus());
    })

    return router;
}