/*
Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

http://aws.amazon.com/apache2.0/

or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

*/

import  "dotenv/config";
import express, { Router } from "express";
import session from "express-session";
import bodyParser from "body-parser";
import * as fs from "fs";
import * as http from "node:http";
import { access } from 'node:fs';

import { initialize } from "./server/startup/initializeStreamHelper.js";

// Builder Functions
import { buildDatabase } from "./builders/buildDatabase.js";
import { buildTwitch } from "./builders/buildTwitch.js";
import { buildEvents } from "./builders/buildEvents.js";
import { buildServices } from "./builders/buildServices.js";
import { buildHandlers } from "./builders/buildHandlers.js";
import { buildRouters } from "./builders/buildRouters.js";
import { buildWebsocketServer } from "./websocket/websocketServer.js";

// Server data
export const DEBUG = process.env.NODE_ENV !== "production";
export const MANIFEST = DEBUG ? {} : JSON.parse(fs.readFileSync("static/.vite/manifest.json").toString())

const db = buildDatabase();
const twitch = buildTwitch(db);
const events = buildEvents({db, twitch});
const services = buildServices({db});
buildHandlers({
  eventDispatcher: events.eventDispatcher,
  services,
  db,
  twitch
})
const routers = buildRouters({twitch, db, events, services});

// Initialize Express and middlewares
var app = express();
const server = http.createServer(app);
const webSocketServer = buildWebsocketServer();


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


app.use('/', routers.mainRouter);
// app.use("/house", buildHouseRouter(house_repository));

app.use("/twitch", routers.twitchRouter);

await initialize({twitchUserRepository: db.twitchUserRepository, eventSubService: events.eventSubService});

server.listen(process.env.S_PORT || 3141, () => {
  console.log(`Stream Helper-Server listening on port ${process.env.S_PORT || 3141}...`);
});

webSocketServer.start(server);