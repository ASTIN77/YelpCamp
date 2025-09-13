const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");

// ROOT ROUTE
router.get("/", (req, res) => {
  res.render("landing");
});

// REGISTER FORM ROUTE
router.get("/register", (req, res) => {
  res.render("register");
});

// REGISTER CREATE ROUTE
router.post("/register", (req, res) => {
  const newUser = new User({ username: req.body.username });
  User.register(newUser, req.body.password)
    .then((user) => {
      req.login(user, (err) => {
        if (err) {
          req.flash("error", "Login failed after registration.");
          return res.redirect("/login");
        }
        req.flash(
          "success",
          "Welcome " + user.username + ". You have successfully registered!"
        );
        res.redirect("/campgrounds");
      });
    })
    .catch((err) => {
      req.flash("error", err.message);
      return res.redirect("/register");
    });
});

// LOGIN FORM ROUTE
router.get("/login", (req, res) => {
  res.render("login");
});

// LOGGING IN ROUTE
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

// LOGOUT ROUTE
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are now logged out.");
    res.redirect("/campgrounds");
  });
});

module.exports = router;
