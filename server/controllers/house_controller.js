import { Router } from "express";
import { sessionMiddleware } from "../middleware.js";

function buildHouseController(HouseRepository) {
    const router = Router();

    router.get("/", sessionMiddleware,  (req, res) => {
        res.json({results: "Hello World"})
    })

    router.get('/styles', sessionMiddleware, async (req, res) => {
        let woods = await HouseRepository.getWoods();
        let styles = await HouseRepository.getStyles();

        res.json({woods, styles});
    })

    router.post('/random', sessionMiddleware, async (req, res) => {
        let results = await HouseRepository.getSingle(req.body.wall, req.body.roof, req.body.style);
        res.json(results)
    })

    router.post('/set', sessionMiddleware, async (req, res) => {
        let results = await HouseRepository.setHouse(req.body.wall, req.body.roof, req.body.style);
        
        res.json(results);
    })

    return router;
}

export { buildHouseController }