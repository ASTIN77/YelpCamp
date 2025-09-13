const Campground = require("../models/campground");
const Comment = require("../models/comment");

const middlewareObj = {};

// Must be logged in
middlewareObj.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  req.flash("error", "You need to be logged in to do that!");
  res.redirect("/login");
};

// Campground ownership
middlewareObj.checkCampgroundOwnership = (req, res, next) => {
  if (!(req.isAuthenticated && req.isAuthenticated())) {
    req.flash("error", "You need to be logged in to do that!");
    return res.redirect("/login");
  }

  Campground.findById(req.params.id)
    .then((campground) => {
      if (!campground) {
        req.flash("error", "Campground not found!?!");
        return res.redirect("back");
      }

      const authorId = campground.author && campground.author.id;
      const isOwner =
        authorId &&
        (typeof authorId.equals === "function"
          ? authorId.equals(req.user._id)
          : String(authorId) === String(req.user._id));

      if (isOwner) return next();

      req.flash("error", "You do not have permission to do that.");
      res.redirect("back");
    })
    .catch((err) => {
      console.error("checkCampgroundOwnership error:", err);
      req.flash("error", "An error occurred.");
      res.redirect("back");
    });
};

// Comment ownership
middlewareObj.checkCommentOwnership = (req, res, next) => {
  if (!(req.isAuthenticated && req.isAuthenticated())) {
    req.flash("error", "You need to be logged in to do that!");
    return res.redirect("/login");
  }

  Comment.findById(req.params.comment_id)
    .then((comment) => {
      if (!comment) {
        req.flash("error", "Comment not found!?!");
        return res.redirect("back");
      }

      const authorId = comment.author && comment.author.id;
      const isOwner =
        authorId &&
        (typeof authorId.equals === "function"
          ? authorId.equals(req.user._id)
          : String(authorId) === String(req.user._id));

      if (isOwner) return next();

      req.flash("error", "You do not have permission to do that.");
      res.redirect("back");
    })
    .catch((err) => {
      console.error("checkCommentOwnership error:", err);
      req.flash("error", "An error occurred.");
      res.redirect("back");
    });
};

module.exports = middlewareObj;
