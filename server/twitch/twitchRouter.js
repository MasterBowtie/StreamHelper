import { Router } from "express";
import { DEBUG, MANIFEST } from "../../index.js";
import { sessionMiddleware } from "../middleware.js";
import { buildAuthRouter } from "./authRouter.js";
import dotenv from "dotenv";

function buildTwitchRouter({UserRepository, twitchAuthService}) {
    const router = Router();

    router.use("/auth", buildAuthRouter({twitchAuthService}))


    // need to update to new system
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
    
    return router;
}

export { buildTwitchRouter }