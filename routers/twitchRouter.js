import { Router } from "express";
import { buildAuthRouter } from "./authRouter.js";
import dotenv from "dotenv";


function buildTwitchRouter({authRouter}) {
    const router = Router();

    // Public auth Routes
    router.use("/auth", authRouter);

    router.get("/status", (req, res) =>{
        
    })

    
    return router;
}

export { buildTwitchRouter }