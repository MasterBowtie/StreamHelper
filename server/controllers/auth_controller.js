import { Router } from "express";
import {
    getLoginUrl,
    exchangeCodeForToken
} from "../services/twitchAuthService.js"

function buildAuthController() {
    const router = Router();

    router.get('/login', (req, res) => {
        res.redirect(getLoginUrl());
    });

    router.get("/callback", async (req, res) => {
        try {
            const { code } = req.query;

            const tokenData = await exchangeCodeForToken(code);

            res.json(tokenData);
        } catch (error) {
            console.error(error);
            res.status(500).json({
                error: "Authentication failed"
            });
        }
    });

    return router
}

export { buildAuthController }
