"use strict";
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
const express = require("express");
const myDB = require("./connection");
const fccTesting = require("./freeCodeCamp/fcctesting.js");
const session = require("express-session");
const passport = require("passport");
const routes = require("./routes");
const auth = require("./auth");

const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
app.set("view engine", "pug");
fccTesting(app); //For FCC testing purposes
app.use("/public", express.static(process.cwd() + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
app.use(passport.initialize());
app.use(passport.session());
myDB(async (client) => {
  const myDataBase = await client.db("database").collection("users");
  routes(app, myDataBase);
  auth(app, myDataBase);
  io.on("connection", (socket) => {
    console.log("A user has connected");
  });
  app.use((req, res, next) => {
    res.status(404).type("text").send("Not Found");
  });
}).catch((err) => {
  app.route("/").get((req, res) => {
    res.render("pug", { title: err, message: "Unable to login" });
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log("Listening on port " + PORT);
});
