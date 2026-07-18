import { Router } from "express";
import { buildAuthRouter } from "./authRouter.js";


function buildTwitchRouter(components, authRouter) {
    const router = Router();

    // Public auth Routes
    router.use("/auth", authRouter);

    router.get("/status", (req, res) =>{
        
    })

    
    return router;
}

export { buildTwitchRouter }