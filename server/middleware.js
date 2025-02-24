const publicMiddleware = (req, res, next) => {
    console.log("Public Middleware");
    next()
}

// If user has an authenticated session, display it, otherwise display link to authenticate
const sessionMiddleware = (req, res, next) => {
    if(req.session && req.session.passport && req.session.passport.user) {
        next()
    } else {   
        res.redirect("/auth/twitch");
    }
}

export { publicMiddleware, sessionMiddleware }