import { Router } from "express";

function buildAuthRouter({twitchAuthService, userRepository, eventSubService}) {
    const router = Router();

    // Redirect to Twitch Login
    router.get('/login', (req, res) => {
        const url = twitchAuthService.getLoginUrl();

        res.redirect(url);
    });

    // Twitch Oauth callback
    router.get("/callback", async (req, res) => {
        try {
            const auth = await twitchAuthService.authenticateBroadcaster(req.query.code);
            
            const broadcaster = await userRepository.getBroadcaster();
            if (!broadcaster) {
                // Upsert broadcaster
                await userRepository.createBroadcaster({
                    twitchUser: auth.twitchUser,
                    token: auth.token
                });
            } else {
                await userRepository.updateBroadcaster({
                    twitchUser: auth.twitchUser,
                    token: auth.token
                })
            }

            // Start EventSub AFTER DB is ready
            await eventSubService.start()

            return res.redirect('/')
        } catch (error) {
            console.error("Authentication failed:", error);
            res.status(500).json({
                error: "Authentication failed"
            });
        }
    });

    return router;
}

export { buildAuthRouter }
