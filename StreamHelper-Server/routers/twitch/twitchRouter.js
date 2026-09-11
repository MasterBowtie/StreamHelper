import { Router } from "express";

export function buildTwitchRouter(components, authRouter, eventSubRouter) {
    const router = Router();

    router.get('/', (req, res)=> {
        res.send(components.twitch.getStatus());
    })
    // Public auth Routes
    router.use("/auth", authRouter);

    router.use('/eventSub', eventSubRouter);

    router.get("/status", (req, res) => {
        res.send(components.twitch.getStatus())
    })

    router.get("/follows", async (req, res) => {
        const broadcaster = components.twitch.getStatus().broadcaster;
        let cursor = null;
        let follows = [];

        const fakeMessage = {
            subscription: {
                type: "channel.follow"
            }
        }

        do {
            const result = await components.twitch.twitchApiClient.getFollowers(broadcaster.twitchId, cursor);
            for (let followData of result.data) {
                follows.push(followData.user_name)
                fakeMessage.subscription.created_at = followData.followed_at;
                fakeMessage.event = {...followData};

                await components.events.eventDispatcher.dispatch({payload: fakeMessage});
            }

            cursor = result.pagination?.cursor ?? null;
        } while (cursor);

        // console.log(components.twitch.twitchApiClient.getFollowers()
        res.send({follows});
    })

    router.get("/stream", async(req, res) => {

        res.send({data: "testing"})
    })
    
    return router;
}