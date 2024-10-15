import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { engine } from 'express-handlebars';
import * as fs from "fs";
import { access, constants, readFile } from 'fs';
import dotenv from "dotenv";
import bodyParser from "body-parser";
import * as https from "node:https";
import * as http from "node:http";
import * as session from "express-session";
import {OAuth2Strategy} from "passport-oauth";

dotenv.config();

const DEBUG = process.env.NODE_ENV !== "production";
const MANIFEST = DEBUG ? {} : JSON.parse(fs.readFileSync("static/.vite/manifest.json").toString())




var privateKey  = fs.readFileSync('cert/cert.key', 'utf8');
var certificate = fs.readFileSync('cert/cert.crt', 'utf8');

var credentials = {key: privateKey, cert: certificate};
const app = express();
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

const httpsServer = https.createServer(credentials, app);
const httpServer = http.createServer(app);

app.use(bodyParser.json());
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
      
      access(file, constants.R_OK, function (err) {
        console.log(err ? `${lookup} doesn't exist` : `${lookup} ' is there`);
      });
      res.redirect(`${process.env.ASSET_URL}${req.url}`)
    } else {
      next();
    }
  });
}

app.get("/", (req, res) => {
    res.render('index', {
      debug: DEBUG,
      jsBundle: DEBUG ? "" : MANIFEST["src/main.jsx"]["file"],
      cssBundle: DEBUG ? "" : MANIFEST["src/main.jsx"]["css"][0],
      assetUrl: process.env.ASSET_URL || "https://localhost:5173",
      layout: false
    });
  });

httpsServer.listen(process.env.S_PORT || 3141, () => {
  console.log(`Secure listening on port ${process.env.S_PORT || 3141}...`);
});

// httpServer.listen(process.env.PORT || 3000, () => {
//   console.log(`Listening on port ${process.env.PORT || 3000}...`);
// });