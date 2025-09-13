const express = require("express");
const router = express.Router({ mergeParams: true });
const Campground = require("../models/campground");
const Comment = require("../models/comment");
const middleware = require("../middleware");

// NEW ROUTE
router.get("/new", middleware.isLoggedIn, (req, res) => {
  Campground.findById(req.params.id)
    .then((campground) => {
      if (!campground) {
        req.flash("error", "Campground not found.");
        return res.redirect("back");
      }
      res.render("comments/new", { campground });
    })
    .catch((err) => {
      console.error("Error finding campground:", err);
      req.flash("error", "No campground found!");
      res.redirect("back");
    });
});

// CREATE ROUTE
router.post("/", middleware.isLoggedIn, (req, res) => {
  Campground.findById(req.params.id)
    .then((campground) => {
      if (!campground) {
        req.flash("error", "Campground not found.");
        return res.redirect("back");
      }

      const commentData = Object.assign({}, req.body.comment, {
        author: { id: req.user._id, username: req.user.username },
      });

      return Comment.create(commentData).then((comment) => {
        campground.comments.push(comment); // cast to ObjectId if array is ref
        return campground.save().then(() => {
          req.flash("success", "Successfully added comment.");
          res.redirect("/campgrounds/" + campground._id);
        });
      });
    })
    .catch((err) => {
      console.error("Error creating comment:", err);
      req.flash("error", "Oops... something went wrong!");
      res.redirect("back");
    });
});

// COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, (req, res) => {
  Comment.findById(req.params.comment_id)
    .then((foundComment) => {
      if (!foundComment) {
        req.flash("error", "Comment not found.");
        return res.redirect("back");
      }
      res.render("comments/edit", {
        campground_id: req.params.id,
        comment: foundComment,
      });
    })
    .catch((err) => {
      console.error("Error finding comment:", err);
      req.flash("error", "Oops... something went wrong!");
      res.redirect("back");
    });
});

// COMMENT UPDATE ROUTE
router.put("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, {
    new: true,
    runValidators: true,
  })
    .then((updated) => {
      if (!updated) {
        req.flash("error", "Comment not found.");
        return res.redirect("back");
      }
      req.flash("success", "Comment successfully updated!");
      res.redirect("/campgrounds/" + req.params.id);
    })
    .catch((err) => {
      console.error("Error updating comment:", err);
      req.flash("error", "Oops... something went wrong!");
      res.redirect("back");
    });
});

// DESTROY COMMENT ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
  Comment.findByIdAndDelete(req.params.comment_id)
    .then((deleted) => {
      if (!deleted) {
        req.flash("error", "Comment not found.");
        return res.redirect("back");
      }
      // Keep campground.comments clean (remove the orphaned ObjectId)
      return Campground.findByIdAndUpdate(
        req.params.id,
        { $pull: { comments: deleted._id } },
        { new: true }
      ).then(() => {
        req.flash("success", "Comment successfully removed.");
        res.redirect("/campgrounds/" + req.params.id);
      });
    })
    .catch((err) => {
      console.error("Error removing comment:", err);
      req.flash("error", "Oops... something went wrong!");
      res.redirect("back");
    });
});


module.exports = router;
