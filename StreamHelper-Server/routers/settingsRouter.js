import { Router } from "express";
import { EVENTS } from "../websocket/events.js";

export function buildSettingsRouter(components) {
    const router = Router();

    router.get("/all", async (req, res, next )=> {
        const results = await components.services.settingService.getAll();
        return res.json({success: true, data: results});
    })

    router.get("/:section", async(req, res, next) => {
        try {
            const { section } = req.params;

            const results = await components.services.settingService.getSection(section);
            return res.json({success: true, data: results});
        } catch (err) {
            next(err);
        }
    })

    router.post("/save", async(req, res, next) => {

    })

    return router;
}