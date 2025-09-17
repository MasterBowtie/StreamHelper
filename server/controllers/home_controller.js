import { Router } from "express";
import { DEBUG, MANIFEST } from "../../index.js";
import { publicMiddleware, sessionMiddleware } from "../middleware.js";

function buildHomeController() {
    const router = Router();

    router.get("/", publicMiddleware, (req, res) => {
        res.render("index", {
            debug: DEBUG,
            jsBundle: DEBUG ? "" : MANIFEST["src/main.jsx"]["file"],
            cssBundle: DEBUG ? "" : MANIFEST["src/main.jsx"]["css"][0],
            assetUrl: process.env.ASSET_URL || "https://localhost:5173",
            layout: false
        })
    })

    router.get("/stream", sessionMiddleware, (req, res) => {
        
    })

    router.get("/bad", sessionMiddleware, (req, res) => {
        res.render("broke", {
            debug: DEBUG,
            jsBundle: DEBUG ? "" : MANIFEST["src/main.jsx"]["file"],
            cssBundle: DEBUG ? "" : MANIFEST["src/main.jsx"]["css"][0],
            assetUrl: process.env.ASSET_URL || "https://localhost:5173",
            layout: false
        })
    })

    return router;
}

export { buildHomeController }
