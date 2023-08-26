// INDEX route - show all campgrounds
var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

// INDEX ROUTE
router.get("/", (req, res) => {
  Campground.find({}).then((allCampgrounds) => {
    if (!allCampgrounds) {
      console.log(err);
    } else {
      res.render("campgrounds/index", { campgrounds: allCampgrounds });
    }
  });
});

// CREATE ROUTE

router.post("/", middleware.isLoggedIn, (req, res) => {
  //get data from form and add to campgrounds array
  var name = req.body.name;
  var price = req.body.price;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
    id: req.user._id,
    username: req.user.username,
  };

  var newCampground = {
    name: name,
    image: image,
    description: desc,
    author: author,
    price: price,
  };
  // Add new campground to database
  Campground.create(newCampground).then((newlyCreated) => {
    if (!newlyCreated) {
      console.log("An error has occured");
    } else {
      res.redirect("/campgrounds");
    }
  });
});

// NEW ROUTE

router.get("/new", middleware.isLoggedIn, (req, res) => {
  res.render("campgrounds/new.ejs");
});

// SHOW ROUTE

router.get("/:id", (req, res) => {
  Campground.findById(req.params.id)
    .populate("comments")
    .then(function (foundCampground) {
      if (!foundCampground) {
        console.log("No Campground found!");
      } else {
        res.render("campgrounds/show", { campground: foundCampground });
      }
    });
});
//EDIT CAMPGROUND ROUTE

router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res) => {
  Campground.findById(req.params.id).then((foundCampground) => {
    res.render("campgrounds/edit", { campground: foundCampground });
  });
});

//UPDATE CAMPGROUND ROUTE

router.put("/:id", middleware.checkCampgroundOwnership, (req, res) => {
  // find and update the correct campground
  Campground.findByIdAndUpdate(req.params.id, req.body.campground).then(
    (updatedCampground) => {
      res.redirect("/campgrounds/" + req.params.id);
    }
  );
});

// DESTROY CAMPGROUND ROUTE

router.delete("/:id", middleware.checkCampgroundOwnership, function (req, res) {
  Campground.findByIdAndRemove(req.params.id).then(() => {
    res.redirect("/campgrounds");
  });
});

module.exports = router;
