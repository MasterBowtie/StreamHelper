import { Router } from "express";
import { DEBUG, MANIFEST } from "../../index.js";
import { sessionMiddleware } from "../middleware.js";
import dotenv from "dotenv";

function buildTwitchController(UserRepository, SubscriberRepository) {
    const router = Router();

    router.get('/recent_sub', sessionMiddleware, async (req, res) => {
        console.log("Get recent sub");
        let results = await SubscriberRepository.getRecent();
        res.json({data: results});
    })

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
                res.json({total: 0,
                    data: [{user_id: 0, user_login: "broken", user_name: "BROKEN"}]
                })
            }
        }).then(data => {
            // console.log(data);
            res.json({
                data
            })
        })
    })
    
    return router;
}

export { buildTwitchController }