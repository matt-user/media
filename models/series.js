var mongoose = require("mongoose");

//schema setup
var seriesSchema = new mongoose.Schema({
	title: String,
	thumbnail: String,
	numSeasons: Number,
	videos: [ 
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Video"
		}
	]
});

module.exports = mongoose.model("Series", seriesSchema);