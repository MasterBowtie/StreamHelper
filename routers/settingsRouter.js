import { Router } from "express";
import { EVENTS } from "../websocket/events";

export function buildSettingsRouter(components) {
    const router = Router();

    // handle requests and posts
    router.put("/:key", async(req, res, next) => {
        try {
            const { key } = req.params;
            const { value } = req.body;

            await components.services.settingService.set({key, value});

            await components.twitch.onSettingChange(key);

            components.websocket.notifier.notify(EVENTS.APP.TWITCH_STATUS_CHANGE);

            res.json({
                success: true
            })

        } catch (err) {
            next(err);
        }
    })

    return router;
}