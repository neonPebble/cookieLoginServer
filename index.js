// maybe i need cors for deploying app to vercel
// vercel is somehow altering import into require and browser console shows require not defined error

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

// the html file for whatever reason uses "/<resource-location>" instead of "/notelist/<resource-location>"
//I can modify the files manually ...but thats not how it is supposed to be done

/*
express.static(root, [options])
root - root directory from which to serve static assets
options is an object not array.
options example :
const options =  {
  dotfiles: 'ignore',
  etag: false,
  extensions: ['htm', 'html'],
  index: false,
  redirect: false,
  setHeaders: function (res,path,stat) {
    res.set('x-timestamp', Date.now())
  }
}
*/

// --------- WHEN NOT DEPLOYING TO VERCEL UNCOMMENT ---------

/*
app.use("/notelist", express.static(path.join(__dirname, "public/listdista")));

app.get("/notelist", isAuth, (req, res, next) => {
  res.sendFile(path.join(__dirname, "public/listdista", "index.html"));
});

// remove these  last two routes when you are done

app.use(
  "/localntlist",
  express.static(path.join(__dirname, "public/loclistdist"))
);
app.get("/localntlist", (req, res, next) => {
  res.sendFile(path.join(__dirname, "public/loclistdist", "index.html"));
});
*/

// -------- WHEN NOT DEPLOYING TO VERCEL COMMENT OUT --------

//the static files with their directories  were put in  ".output/static"  directory

app.use(
  "/public/listdista",
  express.static(path.join(__dirname, ".output/static/public/listdista"))
);
app.get("/notelist", isAuth, (req, res, next) => {
  res.sendFile(path.join(__dirname, "vercelpages/listdista", "index.html"));
});

// remove these  last routes when you are done

app.use(
  "/public/loclistdist",
  express.static(path.join(__dirname, ".output/static/public/loclistdist"))
);

app.get("/localntlist", (req, res, next) => {
  res.sendFile(path.join(__dirname, "vercelpages/loclistdist", "index.html"));
});

/**
 * -------------- SERVER ----------------
 */

// Server listens on http://localhost:5050
const port = process.env.PORT || 5050;
app.listen(port, () => {
  console.log(`app is listening on port ${port}`);
});
