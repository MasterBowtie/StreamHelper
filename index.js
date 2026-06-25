/*
Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

http://aws.amazon.com/apache2.0/

or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

*/

import  "dotenv/config";
import express, { Router } from "express";
import { engine } from 'express-handlebars';
import session from "express-session";
import bodyParser from "body-parser";
import * as fs from "fs";
import * as https from "node:https";
import { Server } from "socket.io";
import { access } from 'node:fs';

// Database & Repositories
import { buildDatabasePool } from "./server/database/database.js";
import { UserRepository } from "./server/database/userRepository.js";

// Twitch
import { buildTwitchAuthService } from "./server/twitch/twitchAuthService.js";
import { buildTokenManager } from "./server/twitch/tokenManager.js";
import { buildTwitchApiClient } from "./server/twitch/twitchApiClient.js";
import { buildEventSubService } from "./server/twitch/eventSubService.js";

// Routers
import { buildTwitchRouter } from "./server/routers/twitchRouter.js";
import { buildAuthRouter } from "./server/routers/authRouter.js";




// Server data
export const DEBUG = process.env.NODE_ENV !== "production";
export const MANIFEST = DEBUG ? {} : JSON.parse(fs.readFileSync("static/.vite/manifest.json").toString())

const db = buildDatabasePool();
const userRepository = new UserRepository(db);


const twitchAuthService = buildTwitchAuthService();
const tokenManager = buildTokenManager({userRepository, twitchAuthService })
const twitchApiClient = buildTwitchApiClient({ tokenManager})
const eventSubService = buildEventSubService({twitchApiClient})
await eventSubService.start();

// Build Routers
const authRouter = buildAuthRouter({
  twitchAuthService, userRepository, eventSubService
});
const twitchRouter = buildTwitchRouter({ authRouter });



var privateKey  = fs.readFileSync('cert/cert.key', 'utf8');
var certificate = fs.readFileSync('cert/cert.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};

// Initialize Express and middlewares
var app = express();
const httpsServer = https.createServer(credentials, app);

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

const io = new Server(httpsServer);

io.on("connection", (socket) => {
  console.log("Connected new socket")

  // socket.emit("channel.chat.message", chat);

  socket.on("disconnect", () => {
    console.log("Disconnected Socket")
  })
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
    // console.log(req.url.includes("."));
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


// app.use('/', buildHomeRouter());
// app.use("/house", buildHouseRouter(house_repository));

app.use("/twitch", twitchRouter);

httpsServer.listen(process.env.S_PORT || 3141, () => {
  console.log(`Secure listening on port ${process.env.S_PORT || 3141}...`);
});