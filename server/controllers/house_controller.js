import { Router } from "express";
import { sessionMiddleware } from "../middleware.js";

function buildHouseController() {
    const router = Router();

    router.get("/", sessionMiddleware,  (req, res) => {
        res.json({results: "Hello World"})
    })

    return router;
}

export { buildHouseController }