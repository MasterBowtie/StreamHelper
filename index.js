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
import { profile } from "console";

dotenv.config();

const DEBUG = process.env.NODE_ENV !== "production";
const MANIFEST = DEBUG ? {} : JSON.parse(fs.readFileSync("static/.vite/manifest.json").toString())

var privateKey  = fs.readFileSync('cert/cert.key', 'utf8');
var certificate = fs.readFileSync('cert/cert.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};

// Setup memory variables
var messages = [];
var knownCheermotes;
var badges;
var topics = {
  chat: false,
}


// Initialize Express and middlewares
var app = express();
const httpsServer = https.createServer(credentials, app);

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');
app.use(session({secret: process.env.SECRET, resave: false, saveUninitialized: false}));
// app.use(express.static('public'));
// app.use(passport.initialize());
// app.use(passport.session());


// WebHooks Start Here

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
      console.log("Connected WebSocket to Twitch!");

      fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {headers: {'Authorization': `Bearer ${profile.accessToken}`, 'Client-Id': process.env.TWITCH_CLIENT_ID}})
      .then(res=> {
        return res.json()
      }).then(res => {
        console.log("Total Cost:", res.total_cost);
      })

      // io.on("connection", (socket) => {
      //   console.log("SocketIO Connect");
      //   socket.on("followers", () => {
      //     if (!topics.follow) {

      //       let broadcaster_id = profile.data[0].id;
      //       let hooks = {
      //         'channel:follow': {version: "2", condition: {"broadcaster_user_id":broadcaster_id, "moderator_user_id": broadcaster_id}}
      //       }
      //       requestHooks(profile.data[0].id, accessToken, session, hooks);
      //       topics.follow = true;
      //     }
      //     // socket.emit('moderator:read:followers', data);
      //   })

      //   socket.on("chat", () => {
      //     if (!topics.chat) {

      //       let user_id = profile.data[0].id;
      //       let broadcaster_user_id = user_id;
      //       let hooks = {

      //         // 'channel.chat.clear': { version: "1", condition: {broadcaster_user_id, user_id } },
      //         // 'channel.chat.clear_user_messages': { version: "1", condition: {broadcaster_user_id, user_id } },
              
      //         // 'channel.chat.message_delete': { version: "1", condition: {broadcaster_user_id, user_id } },
      //         // 'channel.chat.notification': { version: "1", condition: {broadcaster_user_id, user_id } },
      //         // 'channel.chat.message': { version: "1", condition: {broadcaster_user_id, user_id } },
              
      //         // 'channel.chat_settings.update': { version: "1", condition: {broadcaster_user_id, user_id } }
      //       }
      //       requestHooks(profile.data[0].id, accessToken, session, hooks);
      //       topics.chat = true;
      //     }
          
      //     socket.emit("channel.chat.message", messages);
      //     if (!knownCheermotes) {
      //       knownCheermotes = {};
      //       fetch(
      //         `https://api.twitch.tv/helix/bits/cheermotes?broadcaster_id=${profile.data[0].id}`,
      //         {
      //           "headers": {
      //             "Client-ID": process.env.TWITCH_CLIENT_ID,
      //             "Authorization": `Bearer ${accessToken}`
      //           }
      //         }
      //       )
      //     .then(resp => resp.json())
      //     .then(resp => {
      //       let { data } = resp;
      //       if (data) {
      //         // iterate and merge
      //         data.forEach(cheermote => {
      //           let { prefix, tiers } = cheermote;
      //                   if (tiers && tiers.length > 0) {
      //                       knownCheermotes[prefix] = {};

      //                       tiers.forEach(tier => {
      //                           let { can_cheer, id, images } = tier;
      //                           if (can_cheer) {
      //                               let image = images.dark.animated["1.5"];
      //                               knownCheermotes[prefix][id] = image;
      //                           }
      //                       });
      //                   }
      //                 });
      //               }
      //         })
      //       .then(() => {
      //         return fetch ("https://api.twitch.tv/helix/chat/emotes/global")
      //       })
      //       .then( resp => resp.json())
      //       .then(resp => {
      //         let { data } = resp;
      //         if (data) {
      //             // iterate and merge
      //             data.forEach(cheermote => {
      //                 let { prefix, tiers } = cheermote;
      //                 if (tiers && tiers.length > 0) {
      //                   knownCheermotes[prefix] = {};

      //                     tiers.forEach(tier => {
      //                         let { can_cheer, id, images } = tier;
      //                         if (can_cheer) {
      //                             let image = images.dark.animated["1.5"];
      //                             knownCheermotes[prefix][id] = image;
      //                         }
      //                     });
      //                 }
      //               });
      //             }
      //             console.log("Cheers!")
      //             socket.emit("cheerEmotes", knownCheermotes);
      //           })
      //       } else {
      //         socket.emit("cheerEmotes", knownCheermotes);
      //       }

      //       if (!badges) {
      //         badges = {};
      //         fetch(`https://api.twitch.tv/helix/chat/badges/global`,
      //           {  
      //             "headers": {
      //               "Client-ID": process.env.TWITCH_CLIENT_ID,
      //               "Authorization": `Bearer ${accessToken}`
      //             }
      //           }
      //         )
      //         .then(resp => resp.json())
      //         .then(resp => {
      //         let { data } = resp;
      //         if (data) {
      //           data.forEach(set => {
      //             badges[set.set_id] = {}
      //             set.versions.forEach(ver => {
      //               badges[set.set_id][ver.id] = ver.image_url_1x;
      //             })
      //           })
      //         }
      //         return fetch(`https://api.twitch.tv/helix/chat/badges?broadcaster_id=${profile.data[0].id}`,
      //         {  
      //           "headers": {
      //             "Client-ID": process.env.TWITCH_CLIENT_ID,
      //             "Authorization": `Bearer ${accessToken}`
      //           }
      //         })
      //       })
      //       .then(resp => resp.json())
      //       .then(resp => {
      //         let { data } = resp;
      //         if (data) {
      //           data.forEach(set => {
      //             badges[set.set_id] = {}
      //             set.versions.forEach(ver => {
      //               badges[set.set_id][ver.id] = ver.image_url_1x;
      //             })
      //           })
      //         }
      //         console.log("Badges");
      //         socket.emit("badges", badges)
      //       })
      //     } else {
      //       socket.emit("badges", badges);
      //    }
      //  })
      // })
    })

    twitchSocket.on("session-silenced", () => {
      console.log('Session mystery died due to silence detected');
    })
    
    twitchSocket.on('session_keepalive', () => {
    //   console.log(new Date());
    })

    twitchSocket.on("moderator:read:followers", ({ payload })=> {
      console.log(payload)
    })

    done(null, profile);
  }
));
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next()
});


if (!DEBUG) {
  app.use(express.static('static'));
} else {
  app.use((req, res, next) => {
    if (req.url.includes(".")) {
      let lookup = decodeURI(`${process.env.ASSET_URL}${req.url}`);
      let file = lookup.substring(1, lookup.length);
      
      fs.access(file, fs.constants.R_OK, function (err) {
        console.log(err ? `${lookup} doesn't exist` : `${lookup} ' is there`);
      });
      res.redirect(`${process.env.ASSET_URL}${req.url}`)
    } else {
      next();
    }
  });
}

// Set route to start OAuth link, this is where you define scopes to request
app.get('/auth/twitch', passport.authenticate('twitch', { scope: 'user:read:chat' }));

// Set route for OAuth redirect
app.get('/auth/twitch/callback', passport.authenticate('twitch', { successRedirect: '/', failureRedirect: '/' }));

// If user has an authenticated session, display it, otherwise display link to authenticate
app.get('/', function (req, res) {
//   console.log(req.session);
  if(req.session 
    //&& req.session.passport && req.session.passport.user
    ) {
    res.render("index", {
        debug: DEBUG,
        jsBundle: DEBUG ? "" : MANIFEST["src/main.jsx"]["file"],
        cssBundle: DEBUG ? "" : MANIFEST["src/main.jsx"]["css"][0],
        assetUrl: process.env.ASSET_URL || "https://localhost:5173",
        layout: false
    })
  }
  // } else {
  //   res.redirect("/auth/twitch");
  // }
});


httpsServer.listen(process.env.S_PORT || 3141, () => {
  console.log(`Secure listening on port ${process.env.S_PORT || 3141}...`);

});