/*
Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

    http://aws.amazon.com/apache2.0/

or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

*/

// https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

// Define our dependencies
import {fileURLToPath} from 'node:url';
import { OAuth2Strategy } from "passport-oauth";
import passport from "passport";
// var twitchStrategy = require("passport-twitch").Strategy;
import express, { Router } from "express";
import { engine } from 'express-handlebars';
import dotenv from "dotenv";
import session from "express-session";
import bodyParser from "body-parser";
import { PrismaClient } from "@prisma/client";
import {initSocket, requestHooks, requestSockets} from "./server/socket/socket.js";
import * as fs from "fs";
import * as https from "node:https";
import { Server } from "socket.io";
import { createHmac } from 'node:crypto';

// import { test } from './server/controllers/house_controller.js';
import { HouseRepository } from "./server/repositories/house_repository.js";
import { buildHouseController } from './server/controllers/house_controller.js';
import { buildHomeController } from './server/controllers/home_controller.js';
import { buildTwitchController } from './server/controllers/twitch_controller.js';
import { UserRepository } from './server/repositories/user_repository.js';

dotenv.config();

export const DEBUG = process.env.NODE_ENV !== "production";
export const MANIFEST = DEBUG ? {} : JSON.parse(fs.readFileSync("static/.vite/manifest.json").toString())
const db = new PrismaClient();
const house_repository = HouseRepository.getInstance(db);
const user_repository = UserRepository.getInstance(db);
var twitchToken;
var broadcaster;

var privateKey  = fs.readFileSync('cert/cert.key', 'utf8');
var certificate = fs.readFileSync('cert/cert.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};
var chat = []

// Initialize Express and middlewares
var app = express();
const httpsServer = https.createServer(credentials, app);

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');
app.use(session({secret: process.env.SECRET, resave: false, saveUninitialized: false}));


// WebHooks Start Here

var twitchSocket;
const io = new Server(httpsServer);

io.on("connection", (socket) => {
  console.log("Connected new socket")
  socket.on("disconnect", () => {
    console.log("Disconnected Socket")
  })
})
      
      
      // Override passport profile function to get user profile from Twitch API
OAuth2Strategy.prototype.userProfile = async (accessToken, done )=>  {
  fetch('https://api.twitch.tv/helix/users', {
    method: 'GET',
    headers: {
      'Client-ID': process.env.TWITCH_CLIENT_ID,
      'Accept': 'application/vnd.twitchtv.v5+json',
      'Authorization': 'Bearer ' + accessToken
    }
  })
  .then(res => {
    if (res.ok) {
      return res.json()
    }
    else {
      done(JSON.parse(data))
    }
  }).then(data => {
    done(null, data);
  })
}

passport.serializeUser(function(user, done) {
    done(null, user)
});

passport.deserializeUser(function(user, done) {
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
    // console.log("Profile", profile.data[0].id);
    // console.log("Profile: ", profile.data[0]);

    user_repository.createUser(profile.data[0].login, profile.data[0].id);
    user_repository.setToken(process.env.TWITCH_CLIENT_ID, accessToken, profile.data[0].id);
    twitchToken = accessToken;
    broadcaster = profile.data[0];
    let topics = null;

    requestHooks(profile.data[0].id, accessToken, )


    done(null, profile);
  }
));

// Webhook Handlers
app.post('/webhook', (req, res) => {
  var message = req.headers['twitch-eventsub-message-type'];
  if (message === 'webhook_callback_verification') {
    return res.send(req.body.challenge);
  }
  
  var hmac = createHmac('sha256', process.env.TWITCH_SECRET)
    .update(req.headers['twitch-eventsub-message-id'] + req.headers['twitch-eventsub-message-timestamp'] + body)
    .digest('hex');
  
  if (`sha256=${hmac}` !== req.headers['twitch-eventsub-message-signature']) {
    return res.sendStatus("403");
  }

  if (req.body.subscription.type == 'channel.subscribe') {

  }
  if (req.body.subscription.type == 'channel.follow') {
    console.log("Follow Event: ", req.body.event);
    // io.emit("channel.follow", )
  }
})

app.use(bodyParser.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next()
});


//Serve static assets
if (!DEBUG) {
  app.use(express.static('static'));
} else {
  app.use((req, res, next) => {
    if (req.url.includes(".")) {
      // let lookup = decodeURI(`${process.env.ASSET_URL}${req.url}`);
      // let file = lookup.substring(1, lookup.length);
      
      // fs.access(file, fs.constants.R_OK, function (err) {
      //   console.log(err ? `${lookup} doesn't exist` : `${lookup} ' is there`);
      // });
      // console.log("Redirect")
      res.redirect(`${process.env.ASSET_URL}${req.url}`)
    } else {
      next();
    }
  });
}


app.use('/', buildHomeController());
app.use("/house", buildHouseController(house_repository));
app.use("/twitch", buildTwitchController(user_repository));


// Set route to start OAuth link, this is where you define scopes to request
app.get('/auth/twitch', passport.authenticate('twitch', { scope: 'channel:bot user:read:chat moderator:manage:announcements moderator:read:followers' }))

// Set route for OAuth redirect
app.get('/auth/twitch/callback', passport.authenticate('twitch', {successRedirect: "/", failureRedirect: '/bad' }));


httpsServer.listen(process.env.S_PORT || 3141, () => {
  console.log(`Secure listening on port ${process.env.S_PORT || 3141}...`);
});