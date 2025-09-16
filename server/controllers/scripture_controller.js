import { Router } from "express";
import { sessionMiddleware, publicMiddleware } from "../middleware.js";

function buildScriptureController(ScriptureRepository) {
    const router = Router();

    router.post("/daily", async (req, res) => {
        let date = req.body.date? req.body.date: null;
        let scriptures = await ScriptureRepository.getDaily(date);

        res.json(scriptures);
    })

    router.get("/collections", async (req, res) => {
        let collections = await ScriptureRepository.getCollections();
        // console.log(collections);
        res.json(collections);
    })

    router.post("/update", async (req, res) => {
        if (req.body.id === "New") {
            let newScript = await ScriptureRepository.createScripture(req.body);
            res.json(newScript);
        } else {
            let updatedScript = await ScriptureRepository.updateScripture(req.body);
            res.json(updatedScript);
        }
    })

    router.delete("/delete", async (req, res) => {
        console.log("Delete: ", req.body);
        let deleteScript = await ScriptureRepository.deleteScripture(req.body);
        res.json(deleteScript); 
    })

    // router.get("/", publicMiddleware,  (req, res) => {
    //     res.json({results: "Hello World"})
    // })

    // router.get('/styles', publicMiddleware, async (req, res) => {
    //     let woods = await HouseRepository.getWoods();
    //     let styles = await HouseRepository.getStyles();

    //     res.json({woods, styles});
    // })

    // router.post('/random', sessionMiddleware, async (req, res) => {
    //     let results = await HouseRepository.getSingle(req.body.wall, req.body.roof, req.body.style);
    //     res.json(results)
    // })

    // router.post('/set', sessionMiddleware, async (req, res) => {
    //     let results = await HouseRepository.setHouse(req.body.wall, req.body.roof, req.body.style);
        
    //     res.json(results);
    // })

    return router;
}

export { buildScriptureController }