var mongoose = require("mongoose");

//schema setup
var videoSchema = new mongoose.Schema({
	name: String,
	thumbnail: String,
	video: String,
	description: String
});

module.exports = mongoose.model("Video", videoSchema);