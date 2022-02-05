const router = require("express").Router();
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
  if (req.isAuthenticated) {
    //res.send('<h2>you have already registered</h2>')
    res.redirect("/");
  } else {
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
  }
});

/**
 * -------------- GET ROUTES ----------------
 */

router.get("/", (req, res, next) => {
  res.send(
    '<h1>Home</h1><p>Please <a href="/register">register</a><br>or <a href="/login>LOGIN</a>"</p>'
  );
});

router.get("/user", (req, res, next) => {
  if (req.isAuthenticated) {
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
  res.send("You made it to the route.");
});

// Visiting this route logs the user out
router.get("/logout", (req, res, next) => {
  req.logout();
  res.redirect("/protected-route");
});

router.get("/login-success", (req, res, next) => {
  res.send(
    '<p>You successfully logged in. --> <a href="/protected-route">Go to protected route</a></p>'
  );
});

router.get("/login-failure", (req, res, next) => {
  res.send("You entered the wrong password.");
});

module.exports = router;