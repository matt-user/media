var mongoose = require("mongoose");

var movieSchema = new mongoose.Schema({
	name: String,
	thumbnail: String,
	video: String,
	description: String
});

module.exports = mongoose.model("Movie", movieSchema);