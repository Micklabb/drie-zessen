/*
 * embed webpack-dev-server
 */
let webpack, webpackDevMiddleware, webpackHotMiddleware, webpackConfig;
if (process.env.NODE_ENV !== "production") {
    webpack = require("webpack");
    webpackDevMiddleware = require("webpack-dev-middleware");
    webpackConfig = require("../../webpack.config");
    webpackHotMiddleware = require("webpack-hot-middleware");
}

import http from "http";
import path from 'path';
import express from 'express';
//import serveIndex from 'serve-index';
import cors from 'cors';
import { Server } from 'colyseus';
import { monitor } from '@colyseus/monitor';

import { GameRoom } from "./rooms/GameRoom";

export const port = Number(process.env.PORT || 2567) + Number(process.env.NODE_APP_INSTANCE || 0);
export const endpoint = "localhost";

export let STATIC_DIR: string;

const app = express();

app.use(cors());
app.use(express.json())

const server = http.createServer(app);
const gameServer = new Server({
  server,
});

gameServer.define('game', GameRoom);

if (process.env.NODE_ENV !== "production") {
    const webpackCompiler = webpack(webpackConfig({}));
    app.use(webpackDevMiddleware(webpackCompiler, {}));
    app.use(webpackHotMiddleware(webpackCompiler));

    // on development, use "../../" as static root
    STATIC_DIR = path.resolve(__dirname, "..", "..");

} else {
    // on production, use ./public as static root
    STATIC_DIR = path.resolve(__dirname, "public");
}

app.use("/", express.static(STATIC_DIR));

// add colyseus monitor
//const auth = basicAuth({ users: { 'admin': 'admin' }, challenge: true });
app.use("/colyseus", monitor());

gameServer.listen(port);
console.log(`Listening on http://${endpoint}:${port}`);
