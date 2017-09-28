var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment");

// define sample campground data for database initialisation

var data = [{
        name: "Cloud's Rest",
        image: "https://uk.businessesforsale.com/uk/static/articleimage?articleId=10065&name=image2.jpg",
        description: "Colourful campground in the sky surrounded by stunning hills. Lorem ipsum dolor sit amet, facilisi feugiat suspendisse nam nec convallis quis, donec sed ante ligula aliquet, nullam urna amet neque et, ligula amet. Ut eget, in semper vel id, nulla eget ut lorem eleifend. Consequat in sollicitudin odio magnis mauris non, egestas wisi ullamcorper consectetuer imperdiet aenean, mauris ornare etiam et sed, ornare non in metus sollicitudin, euismod dui tempus ligula. Pede scelerisque aliquam adipisicing gravida praesent felis, id dis dui. Donec etiam ut turpis eget ligula. Auctor aliquam ante nonummy, mattis scelerisque vestibulum mi. Dictumst tellus varius, leo ipsum ad blandit posuere sagittis tristique, orci nulla in accumsan, luctus metus euismod, quam nullam sit sapien. Risus donec est velit sem, suspendisse ultrices ut vivamus blandit curabitur. Mollis sit, at fuga sit netus. Vivamus cras, mattis erat augue ac mi, suscipit pede in posuere neque varius. Eos mattis nisl turpis nec sit at, fusce nulla a sodales. Tellus eros ipsum vestibulum auctor cras, odio hac lacus libero orci mauris tellus, blandit lectus sed laoreet justo, nam suscipit sodales magna sit, mi aliquam."
    },

    {
        name: "Loch TeePee",
        image: "https://www.wildernessscotland.com/wp-content/uploads/2016/04/best-places-to-camp-scotland.jpg",
        description: "Wigwams for all the family on the banks of a small Loch. Id elit egestas orci pellentesque a, proin eveniet, suscipit non, ligula semper. Turpis est vel vehicula molestie aliquam eu, feugiat eget vitae. Amet ante, nulla non luctus dui nam. Sed a, in molestie mollitia vestibulum cras, dui in. In tortor. Convallis proin amet, vel adipiscing risus arcu, occaecat urna. Eget tellus, enim est, praesent pellentesque in semper diam non nulla, dolor suscipit suspendisse nec nulla sed. Quisque amet lacus leo. Viverra at venenatis, tincidunt eleifend sunt, vulputate orci tincidunt. Proin nam vestibulum, convallis velit, turpis nisl cras. Vel ac elit praesent nec, volutpat sapien laudantium, pellentesque vitae, tristique pellentesque, velit metus tellus sed tellus libero. Eu hymenaeos massa."
    },

    {
        name: "Aberfeldy Elf Woods",
        image: "https://assets.bedful.com/images/f60eaf793db2a91a1e6bff79948fb2997e3addd0/large/image/pop-up-campsites.jpg",
        description: "Camp in amongst the lushest green trees in the heart of a Scottish forest. Pede egestas wisi sapien elit in, donec elit suspendisse, neque diam quam, id nulla iaculis in urna urna nascetur. Metus praesent ante feugiat, duis quis donec dignissim nulla velit felis. Accumsan in nec interdum, sodales in tincidunt sit vivamus at, sodales maecenas id quisque nunc consequatur, elit pellentesque. Commodo dui malesuada dolor, viverra venenatis, in platea consequat, tortor in neque do consectetuer non. Wisi lacus, dui quam quisque ac ullamcorper. Facilisi laoreet gravida integer risus, sit amet mi pellentesque ut, adipiscing cursus in, condimentum at sollicitudin lectus morbi amet sociis, et vivamus leo. Dolor a vel urna, libero non aptent rutrum ut, suspendisse quam non mi nec vel libero, quo nunc mi non vel id wisi."
    }

]

function seedDB() {

    // Remove all campgrounds
    Campground.remove({}, function(err) {
        if (err) {
            console.log(err);
        }
        else {
            console.log("Cleared Campgrounds Database");
            // add a few campgrounds
            console.log("Populating database with sample campgrounds");
            data.forEach(function(seed) {
                Campground.create(seed, function(err, campground) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        console.log("Added a new campground.");
                        // create a comment
                        Comment.create({
                            text: "This place is great but I wish there was internet!",
                            author: "Andrew"
                        }, function(err, comment) {
                            if (err) {
                                console.log(err);
                            }
                            else {
                                campground.comments.push(comment);
                                campground.save();
                                console.log("Created new comment");
                            }

                        });
                    }

                });
            });
        }

    });
}




module.exports = seedDB;
