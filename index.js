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
import express, { response, Router } from "express";
import { engine } from 'express-handlebars';
import dotenv from "dotenv";
import session from "express-session";
import bodyParser from "body-parser";
import { PrismaClient } from "@prisma/client";
import {initSocket, requestAppHooks, requestUserHooks} from "./server/socket/socket.js";
import * as fs from "fs";
import * as https from "node:https";
import * as http from "node:http";
import { Server } from "socket.io";
import { createHmac, timingSafeEqual } from 'node:crypto';

// import { test } from './server/controllers/house_controller.js';
import { HouseRepository } from "./server/repositories/house_repository.js";
import { buildHouseController } from './server/controllers/house_controller.js';
import { buildController } from './server/middleware.js';
import { buildTwitchController } from './server/controllers/twitch_controller.js';
import { buildScriptureController } from './server/controllers/scripture_controller.js';
import { UserRepository } from './server/repositories/user_repository.js';
import { SubscriberRepository } from './server/repositories/subscriber_repository.js';
import { ScriptureRepository } from './server/repositories/scripture_repository.js';

dotenv.config();

export const DEBUG = process.env.NODE_ENV !== "production";
export const MANIFEST = DEBUG ? {} : JSON.parse(fs.readFileSync("static/.vite/manifest.json").toString())
const db = new PrismaClient();
const house_repository = HouseRepository.getInstance(db);
const user_repository = UserRepository.getInstance(db);
const sub_repository = SubscriberRepository.getInstance(db);
const scripture_repository = ScriptureRepository.getInstance(db);
var twitchToken;
var broadcaster;

var privateKey  = fs.readFileSync('cert/cert.key', 'utf8');
var certificate = fs.readFileSync('cert/cert.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};
var chat = []

// Initialize Express and middlewares
var app = express();
const httpsServer = https.createServer(credentials, app);
const hookServer = http.createServer(app);

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');
app.use(session({secret: process.env.SECRET, resave: false, saveUninitialized: false}));


// WebHooks Start Here

var twitchSocket;
const io = new Server(httpsServer);

io.on("connection", (socket) => {
  // console.log(io.sockets.adapter.rooms);
  socket.on("create", (data) => {
    if (data === "socket" && twitchSocket) {
      console.log("Connected new socket");
      socket.join("socket");
      twitchSocket.connect();
    } else if (data === "webhook") {
      socket.join("webhook");
      console.log("Connected socket for webhook");
    }
  })

  socket.on("disconnect", () => {
    console.log("Disconnected Socket")
    let room = io.sockets.adapter.rooms.get("socket")
    if (!room || room.size < 1) {
      twitchSocket.close();
    }
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
    callbackURL: `${process.env.CALLBACK_URL}:${process.env.S_PORT}/auth/twitch/callback`,
    state: true
  },
  
  async function(accessToken, refreshToken, profile, done) {
    // console.log("Profile", profile.data[0].id);
    // console.log("Profile: ", profile.data[0]);
    let expire = await fetch('https://id.twitch.tv/oauth2/validate', {
    headers: {
      Authorization: `OAuth ${accessToken}`,
    },
    }).then(response => {
      // console.log("Response", response);
      if (response.ok) {
        return response.json();
      }
    })
    .then(data => {
      // console.log(data);
      return Math.floor(Date.now()/1000) + (data.expires_in);
    })

    console.log("Expires", expire);
    user_repository.createUser(profile.data[0].login, profile.data[0].id);
    user_repository.setToken(process.env.TWITCH_CLIENT_ID, accessToken, expire, refreshToken, profile.data[0].id);
    twitchToken = accessToken;
    broadcaster = profile.data[0];
    console.log(`ID: ${broadcaster.id}`);

    try {
        let socketHooks = {
          'channel.chat.message': {version: "1", condition:{"broadcaster_user_id": broadcaster.id, "user_id": broadcaster.id}}
        }
        let appHooks = {
          'channel.subscription.message': {version: "1", condition: {"broadcaster_user_id": broadcaster.id}},
          'channel.subscribe': {version: "1", condition: {"broadcaster_user_id": broadcaster.id}},
          'channel.chat.message': {version: "1", condition:{"broadcaster_user_id": broadcaster.id, "user_id": broadcaster.id}},
          'channel.follow': {version: "2", condition:{"broadcaster_user_id": broadcaster.id, "moderator_user_id": broadcaster.id}},
          'channel.subscribe': {version: "1", condition:{"broadcaster_user_id": broadcaster.id}},
          'channel.ad_break.begin': {version: "1", condition: {"broadcaster_user_id": broadcaster.id}},
          'channel.chat.notification': {version: "1", condition: {"broadcaster_user_id": broadcaster.id, "user_id": broadcaster.id}},
        }
        requestAppHooks(profile.data[0].id, appHooks);

        twitchSocket = new initSocket()
        twitchSocket.on("connect", (session) => {
          console.log(`Connected WebSocket to Twitch for: ${broadcaster.login}`);
          
          requestUserHooks(broadcaster.login, twitchToken, session, socketHooks)
          
          twitchSocket.on("channel.chat.message", ({payload})=> {
            // console.log("Chat: ", payload.event);

            if (!payload.event.message.text.startsWith("!")) {
              chat.push(
                {key: payload.event.message_id,
                  message: payload.event.message, 
                  username: payload.event.chatter_user_name,
                  color: payload.event.color});

              io.to("socket").emit("channel.chat.message", chat);
            } else {
              let type = payload.event.message.text.split(" ")[0];
              if (type === "!vote") {
                io.to("socket").emit("channel.chat.vote", {vote: payload.event.message.text, user: payload.event.chatter_user_login});
              }
            }

              })
          })
        } catch (err) {
          console.error(err);
        }
    done(null, profile);
  }
));

function getHmacMessage(request) {
  return (request.headers['twitch-eventsub-message-id'] + request.headers["twitch-eventsub-message-timestamp"] + request.body);
}

function verifyMessage(hmac, verifySignature) {
  return timingSafeEqual(Buffer.from(hmac), Buffer.from(verifySignature));
}
// https://dev.twitch.tv/docs/eventsub/handling-webhook-events/#verifying-the-event-message

app.use("/webhook", express.raw({ type: 'application/json' }))
// Webhook Handlers
app.post('/webhook', (req, res) => {
  let messageType = req.header('Twitch-Eventsub-Message-Type');
  let messageId = req.header('Twitch-Eventsub-Message-Id');
  let timestamp = req.header('Twitch-Eventsub-Message-Timestamp');
  let signature = req.header('Twitch-Eventsub-Message-Signature');

  let rawBody = req.body.toString();

  let hmac = createHmac('sha256', process.env.SECRET)
    .update(messageId + timestamp + rawBody)
    .digest('hex');

  let expectedSignature = `sha256=${hmac}`;

  if (signature !== expectedSignature) {
    console.error('Invalid signature');
    return res.status(403).send('Forbidden');
  }

  let body = JSON.parse(rawBody);

  if (messageType === 'webhook_callback_verification') {
    return res.status(200).send(body.challenge);
  }

  if (messageType === 'notification') {
    if (body.subscription.type === "channel.chat.notification") {
      let data = {};
      switch (body.event.notice_type) {
        case "sub":
          data = {
            id: body.event.chatter_user_id,
            user_name: body.event.chatter_user_name,
            start_date: Date.now(),
            tier: body.event.sub.sub_tier,
            gifted: false,
            gifted_by_id: null,
            gifted_by_name: null,
            resub_date: null,
          }
          sub_repository.createSub(data);
          break;

        case "resub":
          data = {
            id: body.event.chatter_user_id,
            gifted: body.event.resub.is_gift,
            gifted_by_id: body.event.resub.is_gift? (body.event.resub.gifter_is_anonymous? 0: gifter_user_id): null,
            gifted_by_name: body.event.resub.is_gift? (body.event.resub.gifter_is_anonymous? "Anonymous": gifter_user_id): null,
            resub_date: Date.now()
          }
          sub_repository.updateSub(data);
          break;
        
        case "sub_gift":
          data = {
            id: body.event.sub_gift.recipient_user_id,
            user_name: body.event.sub_gift.recipient_user_name,
            start_date: Date.now(),
            tier: body.event.sub_gift.sub_tier,
            gifted: true,
            gifted_by_id: body.event.chatter_user_id,
            gifted_by_name: body.event.chatter_user_name,
            resub_date: null,
          }
          sub
      }
    }
    
    // if (body.subscription.type === "channel.chat.message") {
    //   console.log("Message:", body.event);
    //   io.to("webhook").emit("channel.message.chat", body.event);
    // }
    // console.log('Twitch Event:', body.subscription);
    io.to("webhook").emit(body.subscription.type, body.event);
    
    return res.status(204).end();
  }

  res.status(200).end();
});

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


app.use('/', buildController());
app.use("/house", buildHouseController(house_repository));
app.use("/twitch", buildTwitchController(user_repository, sub_repository));
app.use("/scripture", buildScriptureController(scripture_repository));


// Set route to start OAuth link, this is where you define scopes to request
app.get('/auth/twitch', passport.authenticate('twitch', { scope: 'user:read:chat channel:bot user:bot moderator:read:followers channel:read:subscriptions channel:read:ads channel:read:subscriptions bits:read' }))

// Set route for OAuth redirect
app.get('/auth/twitch/callback', 
  passport.authenticate('twitch', {successRedirect: "/", failureRedirect: '/bad' }
  ));


httpsServer.listen(process.env.S_PORT || 3141, () => {
  console.log(`Secure listening on port ${process.env.S_PORT || 3141}...`);
});

// hookServer.listen(3000, ()=> {
//   console.log(`Webhook listening on port 3000...`);
// })