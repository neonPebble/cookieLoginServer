//all the routes need modification. Just use isAuth middleware for protected routes.
const path = require("path");
const express = require("express");
const router = express.Router();
const passport = require("passport");
const genPassword = require("../lib/passwordUtils").genPassword;
const connection = require("../config/database");
const User = connection.models.User;
const isAuth = require("./authmidlware.js").isAuth;

/**
 * -------------- POST ROUTES ----------------
 */

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login-failure",
    successRedirect: "login-success",
  })
);

//if loggedin user attempts to register again, send some generic denial message or just redirect to home page or logged in page.check using req.isAuthenticated.

router.post("/register", (req, res, next) => {
  const saltHash = genPassword(req.body.pw);

  const salt = saltHash.salt;
  const hash = saltHash.hash;

  const newUser = new User({
    username: req.body.uname,
    hash: hash,
    salt: salt,
  });

  newUser.save().then((user) => {
    console.log(user);
  });

  res.redirect("/login");
});

/*
    --------- fun POST routes ---------
*/

//supposedly you need to redirect to sth after a post and send 201

router.post("/updatenotelist", isAuth, (req, res, next) => {
  req.user.notes = req.body;
  console.log(req.user.notes);

  // seems like the user is mongoose User model instance, so has its methods

  req.user
    .save()
    .then(() => {
      res.status(201).json({ status: "done" });
    })
    .catch((error) => {
      console.log(error);
    });
});

/**
 * -------------- GET ROUTES ----------------
 */

router.get("/", (req, res, next) => {
  res.send(
    '<h1>Home</h1><p>Please <a href="/register">register</a><br>or <a href="/login">LOGIN</a><br><a href="/localntlist">anonymous notelist</a></p>'
  );
});

router.get("/user", (req, res, next) => {
  if (req.isAuthenticated()) {
    res.json({ loggedIn: true, userName: req.user.username });
  } else {
    res.json({ loggedIn: false, userName: "Guest" });
  }
});

// When you visit  <url>/login, you will see "Login Page"
router.get("/login", (req, res, next) => {
  const form =
    '<h1>Login Page</h1><form method="POST" action="/login">\
    Enter Username:<br><input type="text" name="uname">\
    <br>Enter Password:<br><input type="password" name="pw">\
    <br><br><input type="submit" value="Submit"></form>';

  res.send(form);
});

// When you visit <url>/register, you will see "Register Page"
router.get("/register", (req, res, next) => {
  const form =
    '<h1>Register Page</h1><form method="post" action="register">\
                    Enter Username:<br><input type="text" name="uname">\
                    <br>Enter Password:<br><input type="password" name="pw">\
                    <br><br><input type="submit" value="Submit"></form>';

  res.send(form);
});

router.get("/protected-route", isAuth, (req, res, next) => {
  res.send(
    '<h2>You made it to the route.</h2><br><p><a href="/notelist">notelist</a></p>'
  );
});

// Visiting this route logs the user out
router.get("/logout", (req, res, next) => {
  if (req.isAuthenticated()) {
    req.logout();
    res.redirect("/");
  } else {
    res.redirect("/");
  }
});

//all these logged-in routes need to be modified to not allow direct access by just using the url. also use try catch when dealing with user provided stuff

router.get("/login-success", (req, res, next) => {
  if (req.isAuthenticated()) {
    res.send(
      '<p>You successfully logged in. --> <a href="/protected-route">Go to protected route</a></p>'
    );
  } else {
    res.redirect("/login");
  }
});

router.get("/login-failure", (req, res, next) => {
  res.send("You entered the wrong password.");
});

/*
    --------- fun GET routes ---------
*/

// This is not working. ?!?

/*router.get("/notelist", isAuth, (req, res, next) => {
  res.sendFile(path.join(__dirname, "../listdist/index.html"));
});
*/

router.get("/getnotelist", isAuth, (req, res, next) => {
  console.log("tried getting notelist");
  res.json({ userNoteList: req.user.notes });
});

module.exports = router;
