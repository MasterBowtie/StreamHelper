import { Router } from "express"

const ENTRY_MAP = {
    main: {src: "src/main.jsx", title: "Main Page"},
    stream: {src: "src/stream.jsx", title: "Stream Helper"},
}

function renderEntry(entryKey) {
    return (req, res) => {
        console.log("ENTER RENDER!")
        const { DEBUG, MANIFEST, ASSET_URL } = req.app.locals;
        let entry = ENTRY_MAP[entryKey];
        if (!entry) return res.status(404).send("Unknown entry");

        if (DEBUG) {
            console.log("DEBUG RENDER")
            return res.render("index", {
                debug: DEBUG,
                assetUrl: ASSET_URL,
                entryPath: entry.src,
                pageTitle: entry.title,
                rootId: entry.rootId,
                layout: false
            });
        } else {
            console.log("MANIFEST RENDER")
            let manifest = MANIFEST?.[entry.src] || {}
            return res.render("index", {
                debug: DEBUG,
                jsBundle: manifest.file || "",
                cssBundle: (manifest.css && manifest.css[0]) || "",
                styles: Array.isArray(manifest.css) ? manifest.css : [],
                pageTitle: entry.title,
                rootId: entry.rootId,
                layout: false,
            })
        }
        console.log("IT BROKE!")
    }
}

// If user has an authenticated session, display it, otherwise display link to authenticate
function buildController() {
    const router = Router();

    router.get("/", renderEntry("main"));
    router.get("/stream", sessionMiddleware);

    return router;
}

function sessionMiddleware (req, res, next) {
    if( req.session && req.session.passport && req.session.passport.user) {
        return renderEntry("stream");
    } else {   
        res.redirect("/auth/twitch");
    }
}


export { buildController, sessionMiddleware }
