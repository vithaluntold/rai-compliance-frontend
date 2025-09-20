const { createServer } = require("https");
const { parse } = require("url");
const next = require("next");
const fs = require("fs");
const express = require("express");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync("/etc/letsencrypt/live/live.audric.io/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/live.audric.io/fullchain.pem"),
};

app.prepare().then(() => {
  const server = express();

  // You can add custom routes here if needed

  server.all("*", (req, res) => {
    return handle(req, res, parse(req.url, true));
  });

  createServer(httpsOptions, server).listen(443, (err) => {
    if (err) throw err;
    // Removed console.log for production
});
});
