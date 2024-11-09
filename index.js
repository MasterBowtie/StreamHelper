/*
Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

    http://aws.amazon.com/apache2.0/

or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

*/

// Define our dependencies
import { OAuth2Strategy } from "passport-oauth";
import passport from "passport";
import express from "express";
import { engine } from 'express-handlebars';
import dotenv from "dotenv";
import session from "express-session";
import request from "request";
import {initSocket, requestHooks} from "./server/socket/socket.js";
import * as fs from "fs";
import * as https from "node:https";
import { Server } from "socket.io";

dotenv.config();

const DEBUG = process.env.NODE_ENV !== "production";
const MANIFEST = DEBUG ? {} : JSON.parse(fs.readFileSync("static/.vite/manifest.json").toString())

var privateKey  = fs.readFileSync('cert/cert.key', 'utf8');
var certificate = fs.readFileSync('cert/cert.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};

// Setup memory variables
var messages = [];


// Initialize Express and middlewares
var app = express();
const httpsServer = https.createServer(credentials, app);

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');
app.use(session({secret: process.env.SECRET, resave: false, saveUninitialized: false}));
// app.use(express.static('public'));
app.use(passport.initialize());
app.use(passport.session());


var twitchSocket = undefined;
const io = new Server(httpsServer);

// Override passport profile function to get user profile from Twitch API
OAuth2Strategy.prototype.userProfile = function(accessToken, done) {
  var options = {
    url: 'https://api.twitch.tv/helix/users',
    method: 'GET',
    headers: {
      'Client-ID': process.env.TWITCH_CLIENT_ID,
      'Accept': 'application/vnd.twitchtv.v5+json',
      'Authorization': 'Bearer ' + accessToken
    }
  };
  
  request(options, function (error, response, body) {
    if (response && response.statusCode == 200) {
      // console.log(response)
      done(null, JSON.parse(body));
    } else {
        // console.log(body)
      done(JSON.parse(body));
    }
  });
}

passport.serializeUser(function(user, done) {
    // console.log(user);
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    // console.log(user);
    done(null, user);
});


//  need to test callback url
passport.use('twitch', new OAuth2Strategy({
    authorizationURL: 'https://id.twitch.tv/oauth2/authorize',
    tokenURL: 'https://id.twitch.tv/oauth2/token',
    clientID: process.env.TWITCH_CLIENT_ID,
    clientSecret: process.env.TWITCH_SECRET,
    grant_type: "client_credentials",
    callbackURL: process.env.CALLBACK_URL,
    state: true
  },
  function(accessToken, refreshToken, profile, done) {
    profile.accessToken = accessToken;
    profile.refreshToken = refreshToken;

    // Securely store user profile in your DB
    //User.findOrCreate(..., function(err, user) {
    //  done(err, user);
    //});
    console.log(profile.data[0].id);
    twitchSocket = new initSocket(true);

    twitchSocket.on("connect", (session) => {
      requestHooks(profile.data[0].id, profile.data[0].id, accessToken, session);

    })

    twitchSocket.on("session-silenced", () => {
      console.log('Session mystery died due to silence detected');
    })
    
    twitchSocket.on('session_keepalive', () => {
    //   console.log(new Date());
    })

    twitchSocket.on("channel.chat.message", ({ payload })=> {
      let { event } = payload;
      messages = [...messages, event];
      io.emit("channel.chat.message", messages);
    })

    done(null, profile);
  }
));

// Set route to start OAuth link, this is where you define scopes to request
app.get('/auth/twitch', passport.authenticate('twitch', { scope: 'user:read:chat' }));

// Set route for OAuth redirect
app.get('/auth/twitch/callback', passport.authenticate('twitch', { successRedirect: '/', failureRedirect: '/' }));

// If user has an authenticated session, display it, otherwise display link to authenticate
app.get('/', function (req, res) {
//   console.log(req.session);
  if(req.session && req.session.passport && req.session.passport.user) {
    res.render("index", {
        debug: DEBUG,
        jsBundle: DEBUG ? "" : MANIFEST["src/main.jsx"]["file"],
        cssBundle: DEBUG ? "" : MANIFEST["src/main.jsx"]["css"][0],
        assetUrl: process.env.ASSET_URL || "https://localhost:5173",
        layout: false
    })
  } else {
    res.redirect("/auth/twitch");
  }
});


httpsServer.listen(process.env.S_PORT || 3141, () => {
  console.log(`Secure listening on port ${process.env.S_PORT || 3141}...`);

});