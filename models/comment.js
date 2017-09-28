var mongoose = require("mongoose");

// SCHEMA SETUP

var commentSchema = new mongoose.Schema({
    text: String,
    author: {
        id: {type: mongoose.Schema.ObjectId, ref: "User" },
        username: String
    }
});



module.exports = mongoose.model("Comment", commentSchema);