import { Router } from "express";

function buildAuthRouter({twitchAuthService}) {
    const router = Router();

    router.get('/login', (req, res) => {
        const url = twitchAuthService.getLoginUrl();

        res.redirect(url);
    });

    router.get("/callback", async (req, res) => {
        try {
            const tokenData = await twitchAuthService.exchangeCodeForToken(req.query.code);

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

export { buildAuthRouter }
