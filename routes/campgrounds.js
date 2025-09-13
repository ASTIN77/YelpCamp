const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const middleware = require("../middleware");

// INDEX ROUTE - list all campgrounds
router.get("/", (req, res) => {
  Campground.find({})
    .then((allCampgrounds) => {
      res.render("campgrounds/index", { campgrounds: allCampgrounds });
    })
    .catch((err) => {
      console.error("Error fetching campgrounds:", err);
      req.flash("error", "An error occurred while loading campgrounds.");
      res.redirect("back");
    });
});

// CREATE ROUTE - add a new campground
router.post("/", middleware.isLoggedIn, (req, res) => {
  const { name, price, image, description } = req.body;
  const author = { id: req.user._id, username: req.user.username };

  const newCampground = {
    name,
    price,
    image,
    description,
    author,
  };

  Campground.create(newCampground)
    .then(() => {
      req.flash("success", "Campground created successfully.");
      res.redirect("/campgrounds");
    })
    .catch((err) => {
      console.error("Error creating campground:", err);
      req.flash("error", "An error occurred while creating the campground.");
      res.redirect("back");
    });
});

// NEW ROUTE - show form
router.get("/new", middleware.isLoggedIn, (req, res) => {
  res.render("campgrounds/new.ejs");
});

// SHOW ROUTE - shows more info about one campground
router.get("/:id", (req, res) => {
  Campground.findById(req.params.id)
    .populate("comments")
    .then((foundCampground) => {
      if (!foundCampground) {
        req.flash("error", "Campground not found.");
        return res.redirect("back");
      }
      res.render("campgrounds/show", { campground: foundCampground });
    })
    .catch((err) => {
      console.error("Error fetching campground:", err);
      req.flash("error", "No campground found.");
      res.redirect("back");
    });
});

// EDIT ROUTE - show edit form
router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res) => {
  Campground.findById(req.params.id)
    .then((foundCampground) => {
      if (!foundCampground) {
        req.flash("error", "Campground not found.");
        return res.redirect("back");
      }
      res.render("campgrounds/edit", { campground: foundCampground });
    })
    .catch((err) => {
      console.error("Error loading edit form:", err);
      req.flash("error", "Unable to load campground for editing.");
      res.redirect("back");
    });
});

// UPDATE ROUTE - apply edits
router.put("/:id", middleware.checkCampgroundOwnership, (req, res) => {
  Campground.findByIdAndUpdate(req.params.id, req.body.campground, {
    new: true,
    runValidators: true,
  })
    .then((updatedCampground) => {
      if (!updatedCampground) {
        req.flash("error", "Campground not found.");
        return res.redirect("back");
      }
      req.flash("success", "Campground updated successfully.");
      res.redirect("/campgrounds/" + req.params.id);
    })
    .catch((err) => {
      console.error("Error updating campground:", err);
      req.flash("error", "An error occurred while updating the campground.");
      res.redirect("back");
    });
});

router.delete("/:id", middleware.checkCampgroundOwnership, (req, res) => {
  Campground.findByIdAndDelete(req.params.id)
    .then((deleted) => {
      if (!deleted) {
        req.flash("error", "Campground not found.");
        return res.redirect("back");
      }
      req.flash("success", "Campground removed.");
      res.redirect("/campgrounds");
    })
    .catch((err) => {
      console.error("Error deleting campground:", err);
      req.flash("error", "An error occurred while removing the campground.");
      res.redirect("back");
    });
});


module.exports = router;
