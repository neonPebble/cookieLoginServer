//mongoose is essentially useless for express-session ..must verify if it is actually working properly
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
var passport = require("passport");
var crypto = require("crypto");
var routes = require("./api/allroutes.js"); // This uses the index.js file in routes folder. To change this you can change the main property in package.json(package.json inside the required folder) to something else(say apiroutes.js)
const isAuth = require("./api/authmidlware.js").isAuth;

const connection = require("./config/database");

const MongoStore = require("connect-mongo");

/**
 * -------------- GENERAL SETUP ----------------
 */

// Gives us access to variables set in the .env file via `process.env.VARIABLE_NAME` syntax
require("dotenv").config();

// Create the Express application
var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * -------------- SESSION SETUP ----------------
 */

const sessionStore = MongoStore.create({
  mongoUrl: process.env.DB_STRING,
  collectionName: "sessions",
});

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // Equals 1 day (im mili seconds)
    },
  })
);

/**
 * -------------- PASSPORT AUTHENTICATION ----------------
 */

// Need to require the entire Passport config module so app.js knows about it
require("./config/passport");

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  // console.log(req.session);
  // console.log(req.user);
  next();
});

/**
 * -------------- ROUTES ----------------
 */
//just not working?? why is using on specific path not working?
/*
app.use("/notelist", express.static(path.join(__dirname, "listdist")));
app.get("/notelist", isAuth, (req, res, next) => {
  res.sendFile(path.join(__dirname, "listdist/index.html"));
});
*/

// use  all of the routes from ./api/index.js
app.use(routes);

//app.use("/notelist",express.static("listdist"));----- this works for index.html but does not work for other resouces like css sheet javascript file etc.not working at all.
// the files for whatever reason use "/<resource-location>" instead of "/notelist/<resource-location>"
//I can modify the files manually ...but thats not how it is supposed to be done

/*
app.get("/notelist", isAuth, (req, res, next) => {
  res.sendFile(path.join(__dirname, "listdist", "index.html"));
});
*/
app.use("/notelist", isAuth, express.static(path.join(__dirname, "listdist")));

/**
 * -------------- SERVER ----------------
 */

// Server listens on http://localhost:5050
const port = process.env.PORT || 5050;
app.listen(port, () => {
  console.log(`app is listening on port ${port}`);
});
