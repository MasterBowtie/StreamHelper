const publicMiddleware = (req, res, next) => {
    console.log("Public Middleware");
    next()
}

const sessionMiddleware = (req, res, next) => {
    if(req.session && req.session.passport && req.session.passport.user) {
        next()
    } else {   
        res.redirect("/auth/twitch");
    }
}

export { publicMiddleware, sessionMiddleware }