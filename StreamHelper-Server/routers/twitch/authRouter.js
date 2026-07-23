import { Router } from "express";

function buildAuthRouter({twitch, db, events, services, websocket}) {
    const router = Router();


    router.get('/connect', async (req, res) => {
        const {success, data, message} = await twitch.connect();

        if (success && data.mode === "private") {
            return res.redirect(data.mode.url);
        }

        return res.json(data || message);
    });

    router.get('/disconnect', async (req, res) => {
        const result = await twitch.disconnect(events);
        return res.json(result);
    })

    // Twitch Oauth callback
    router.get("/callback", async (req, res) => {
        try {
            const {success, data, message} = await twitch.twitchAuthService.authenticateBroadcaster(req.query.code);
            if (!success) {
                console.warn("OAuth Callback:", message);
                return;
            }

            await db.twitchUserRepository.updateBroadcaster({
                twitchUser: data.twitchUser,
                token: data.token
            })
            
            await events.initialize();

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
