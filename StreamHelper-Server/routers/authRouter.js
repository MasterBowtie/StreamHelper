import { Router } from "express";

function buildAuthRouter({twitch, db, events, services}) {
    const router = Router();


    router.get('/connect', async (req, res) => {
        const result = await twitch.connect();
        res.json(result);
    });

    router.get('/disconnect', async (req, res) => {
        const result = await twitch.disconnect(events);
        res.json(result);
    })

    // Twitch Oauth callback
    router.get("/callback", async (req, res) => {
        try {
            const auth = await twitch.twitchAuthService.authenticateBroadcaster(req.query.code);
        
            await db.twitchUserRepository.updateBroadcaster({
                twitchUser: auth.twitchUser,
                token: auth.token
            })
            
            // Start EventSub AFTER DB is ready
            await events.eventSubService.start()
            await events.eventSubService.registerSubscriptions(auth.twitchUser);

            return res.redirect('/setup-complete')
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
