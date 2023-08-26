var express = require("express");
var router = express.Router({ mergeParams: true });
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");
const campground = require("../models/campground");

//NEW ROUTE
router.get("/new", middleware.isLoggedIn, (req, res) => {
  Campground.findById(req.params.id)
    .error(new Error("No campground found!"))
    .then((campground) => {
      res.render("comments/new", { campground: campground });
    });
});

// CREATE ROUTE

router.post("/", middleware.isLoggedIn, (req, res) => {
  Campground.findById(req.params.id)
    .error(new Error("No campground found!"))
    .then((campground) => {
      Comment.create(req.body.comment).then((comment) => {
        // add username and id to comment
        comment.author.id = req.user._id;
        comment.author.username = req.user.username;
        //save comment
        comment.save();
        campground.comments.push(comment);
        campground.save();
        req.flash("success", "Successfully added comment.");
        res.redirect("/campgrounds/" + campground._id);
      });
    });
});

// COMMENT EDIT ROUTE

router.get(
  "/:comment_id/edit",
  middleware.checkCommentOwnership,
  (req, res) => {
    Comment.findById(req.params.comment_id)
      .error(new Error("Oops....something went wrong!"))
      .then((foundComment) => {
        res.render("comments/edit", {
          campground_id: req.params.id,
          comment: foundComment,
        });
      });
  }
);

// COMMENT UPDATE ROUTE

router.put("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment).then(
    (updatedComent) => {
      if (err) {
        req.flash("error", "Oops....something went wrong!");
        res.redirect("back");
      } else {
        req.flash("success", "Comment successfully updated!");
        res.redirect("/campgrounds/" + req.params.id);
      }
    }
  );
});

// DESTROY COMMENT ROUTE

router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
  Comment.findByIdAndRemove(req.params.comment_id).then(() => {
    if (err) {
      req.flash("error", "Oops....something went wrong!");
      res.redirect("back");
    } else {
      req.flash("success", "Comment successfully removed.");
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});

module.exports = router;
