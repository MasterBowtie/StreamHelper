import  "dotenv/config";
import express, { Router } from "express";
import session from "express-session";
import bodyParser from "body-parser";
import * as fs from "fs";
import * as http from "node:http";
import { access } from 'node:fs';

// Builder Functions
import { buildRepositories } from "./builders/buildRepositories.js";
import { buildServices } from "./builders/buildServices.js";
import { buildTwitch } from "./builders/buildTwitch.js";
import { buildEvents } from "./builders/buildEvents.js";
import { buildRouters } from "./builders/buildRouters.js";
import { buildWebsocketServer } from "./websocket/websocketServer.js";
import { buildWebsocket } from "./builders/buildWebsocket.js";
import { EVENTS } from "./websocket/events.js";

// Server data
export const DEBUG = process.env.NODE_ENV !== "production";
export const MANIFEST = DEBUG ? {} : JSON.parse(fs.readFileSync("static/.vite/manifest.json").toString())

var app = express();
const server = http.createServer(app);
const components = {};

components.db = await buildRepositories();
await components.db.initialize()
components.services = buildServices(components);
await components.services.initialize();
components.websocket = buildWebsocket();
components.twitch = await buildTwitch(components);
const data = await components.twitch.initialize();
components.events = await buildEvents(components);

if (data.initialized) {
  await components.events.initialize(data.broadcaster);
}

components.routers = buildRouters(components);

app.use(bodyParser.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next()
});


//Serve static assets
app.use("/assets", express.static('static'));

app.use('/', components.routers.mainRouter);
app.use("/twitch", components.routers.twitchRouter);
app.use('/settings', components.routers.settingsRouter);
// app.use("/house", buildHouseRouter(house_repository));

server.listen(process.env.S_PORT || 3141, () => {
  console.log(`Stream Helper-Server listening on port ${process.env.S_PORT || 3141}...`);
  components.websocket.websocketServer.start(server);
});
