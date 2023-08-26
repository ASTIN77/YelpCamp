var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

// ROOT ROUTE
router.get("/", function (req, res) {
  res.render("landing");
});

// REGISTER ROUTE
router.get("/register", function (req, res) {
  res.render("register");
});

// REGISTER CREATE ROUTE

router.post("/register", function (req, res) {
  try {
    var newUser = new User({ username: req.body.username });
    User.register(newUser, req.body.password).then((user) => {
      passport.authenticate("local")((req, res) => {
        req.flash(
          "success",
          "Welcome " + user.username + ". You have successfully registered!"
        );
        res.redirect("/campgrounds");
      });
    });
  } catch {
    req.flash("error", err.message);
    return res.redirect("/register");
  }
});

// LOGIN FORM ROUTE

router.get("/login", function (req, res) {
  res.render("login");
});

//LOGGING IN ROUTE

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login",
  }),
  (req, res) => {}
);

// LOGOUT ROUTE

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "You are now logged out.");
  res.redirect("/campgrounds");
});

module.exports = router;
