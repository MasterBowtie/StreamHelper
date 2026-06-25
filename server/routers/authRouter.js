import { Router } from "express";

function buildAuthRouter({twitchAuthService, userRespository, eventSubService}) {
    const router = Router();

    // Redirect to Twitch Login
    router.get('/login', (req, res) => {
        const url = twitchAuthService.getLoginUrl();

        res.redirect(url);
    });

    // Twitch Oauth callback
    router.get("/callback", async (req, res) => {
        try {
            const auth = await twitchAuthService.exchangeCodeForToken(req.query.code);

            // Upsert broadcaster
            await userRespository.createBroadcaster({
                twitchUser: auth.twitchUser,
                token: auth.token
            });

            // Start EventSub AFTER DB is ready
            await eventSubService.start()

            return res.redirect('/')
        } catch (error) {
            console.error('Auth callback failed:', error);
            res.status(500).json({
                error: "Authentication failed"
            });
        }
    });

    return router;
}

export { buildAuthRouter }
