import { Router } from "express";

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

    return router;
}

export { buildScriptureController }