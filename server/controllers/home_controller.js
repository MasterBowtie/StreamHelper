import { Router } from "express";
import { DEBUG, MANIFEST } from "../../index.js";
import { sessionMiddleware } from "../middleware.js";
import dotenv from "dotenv";

function buildHomeController(UserRepository) {
    const router = Router();

    router.get('/followers', sessionMiddleware, async (req, res) => {
        let token = await UserRepository.getToken(process.env.TWITCH_CLIENT_ID)
        fetch(`https://api.twitch.tv/helix/channels/followers?broadcaster_id=${token.user_id}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token.token}`,
                "Client-Id": process.env.TWITCH_CLIENT_ID
            }
        }).then(response => {
            if (response.ok) {
                return response.json()
            }
            else {
                res.json({total: 0})
            }
        }).then(data => {
            res.json({
                data
            })
        })

    })

    router.get("/", sessionMiddleware, (req, res) => {
        res.render("index", {
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
