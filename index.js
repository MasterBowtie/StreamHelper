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
import {initSocket, requestHooks} from "./server/socket/socket.js";
import * as fs from "fs";
import * as https from "node:https";
import { Server } from "socket.io";

// import { test } from './server/controllers/house_controller.js';

// Twitch imports
import { buildTwitchRouter } from './twitch/twitchRouter.js';
import { twitchAuthService } from './twitch/twitchAuthService.js'



import { HouseRepository } from "./server/repositories/house_repository.js";
import { buildHouseRouter } from './routers/houseRouter.js';
import { buildHomeRouter } from './routers/homeRouter.js';
import { UserRepository } from './server/repositories/user_repository.js';
import { access } from 'node:fs';

dotenv.config();

export const DEBUG = process.env.NODE_ENV !== "production";
export const MANIFEST = DEBUG ? {} : JSON.parse(fs.readFileSync("static/.vite/manifest.json").toString())
const db = new PrismaClient();
const house_repository = HouseRepository.getInstance(db);
const user_repository = UserRepository.getInstance(db);
var twitchToken;

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

var twitchSocket = {};
const io = new Server(httpsServer);

io.on("connection", (socket) => {
  console.log("Connected new socket")

  socket.emit("channel.chat.message", chat);

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
    let broadcaster_id = profile.data[0].id;

    twitchSocket = new initSocket(true)
    twitchSocket.on("connect", (session) => {
      console.log(`Connected WebSocket to Twitch for: ${profile.data[0].login}`);

      let hooks = {
        'channel.chat.message': {version: "1", condition:{"broadcaster_user_id": broadcaster_id, "user_id": broadcaster_id}},
        'channel.chat.message_delete': {version: "1", condition: {"broadcaster_user_id": broadcaster_id, "user_id": broadcaster_id}},
        'channel.follow': {version: "2", condition:{"broadcaster_user_id": broadcaster_id, "moderator_user_id": broadcaster_id}}
      }
      let test = requestHooks(profile.data[0].login, accessToken, session, hooks)
      console.log("Testing RequestHooks", test);
      if (!test) {

      }
      twitchSocket[profile.data[0].login].on("channel.chat.message", ({payload})=> {
        // console.log("Chat: ", payload.event);
        
        if (!payload.event.message.text.startsWith("!")) {
          chat.push(
            {key: payload.event.message_id,
              message: payload.event.message, 
              username: payload.event.chatter_user_name,
              color: payload.event.color});
          
          io.emit("channel.chat.message", chat);
        } else {
            let type = payload.event.message.text.split(" ")[0];
            if (type === "!vote") {
              io.emit("channel.chat.vote", {vote: payload.event.message.text, user: payload.event.chatter_user_login});
            }
            if (type === "!avatar") {
              io.emit("channel.chat.avatar", {text: payload.event.message.text, user: payload.event.chatter_user_name});
            }
        }
        
      })

      twitchSocket[profile.data[0].login].on("channel.follow", ({payload}) => {
        io.emit("follow");
      })
    })
    
    
    done(null, profile);
  }
));

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
    console.log(req.url.includes("."));
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


app.use('/', buildHomeRouter());
app.use("/house", buildHouseRouter(house_repository));
app.use("/twitch", buildTwitchRouter(user_repository, twitchAuthService));

httpsServer.listen(process.env.S_PORT || 3141, () => {
  console.log(`Secure listening on port ${process.env.S_PORT || 3141}...`);
});