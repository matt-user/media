var express = require("express")
var router = express.Router();
var Video = require("../models/video");
var Series = require("../models/series");
var fs = require("fs");
var path = require("path");

//index route
router.get("/videos", isLoggedIn, function(req, res){
	Series.find({}, function(err, allSeries){
		if(err){
			console.log(err);
		} else {
			res.render("video/index", {series: allSeries});
		}
	});
});

//new series route
router.get("/videos/series/new", isLoggedIn, function(req, res){
	res.render("video/newSeries");
});

//show series route
router.get("/videos/series/:id", isLoggedIn, function(req, res){
	Series.findById(req.params.id).populate("videos").exec(function(err, foundSeries){
		if(err){
			console.log(err);
		} else {
			console.log(foundSeries);
			res.render("video/showSeries", {series: foundSeries});
		}
	});
});

//create series route
router.post("/videos", isLoggedIn, function(req, res){
	var title = req.body.title;
	var thumbnail = req.body.thumbnail;
	var numSeasons = req.body.numSeasons;
	var newSeries = {title: title, thumbnail: thumbnail, numSeasons: numSeasons};
	Series.create(newSeries, function(err, newlyCreated){
		if(err){
			console.log(err)
		} else {
			res.redirect("/videos");
		}
	});
});


//====================
//videos
//====================

//create video route
router.post("/videos/series/:id/episode", isLoggedIn, function(req, res) {
	Series.findById(req.params.id, function(err, series){
		if(err){
			console.log(err);
		} else {
			Video.create(req.body.video, function(err, video){
				video.save();
				series.videos.push(video);
				series.save();
				res.redirect("/videos/" + series._id);
			});
		}
	});
	// var name = req.body.name;
	// var thumbnail = req.body.thumbnail;
	// var video = __dirname + req.body.video;
	// var desc = req.body.desc;
	// var newVideo = {name: name, thumbnail: thumbnail, video: video, description: desc};
	// Video.create(newVideo, function(err, newlyCreated){
	// 	if(err){
	// 		console.log(err);
	// 	} else {
	// 		res.redirect("/videos/series");
	// 	}
	// });
});

//new episode route
router.get("/videos/series/:id/episode/new", isLoggedIn, function(req, res){
	Series.findById(req.params.id, function(err, series){
		if(err){
			console.log(err);
		} else {
			res.render("video/new", {series: series});
		}
	});
});

//show route
router.get("/videos/:id", isLoggedIn, function(req, res){
	Video.findById(req.params.id).exec(function(err, foundVideo){
		if(err){
			console.log(err);
		} else {
			console.log(foundVideo);
			const path = foundVideo.video;
			const stat = fs.statSync(path);
			const fileSize = stat.size;
			const range = req.headers.range;

			if(range) {
				const parts = range.replace(/bytes=/, "").split("-");
				const start = parseInt(parts[0], 10);
				const end = parts[1]
					? parseInt(parts[1], 10)
					: fileSize-1;

				const chunkSize = (end - start) + 1;
				const file = fs.createReadStream(path, {start, end});
				const head = {
					'Content-Range': `bytes ${start}-${end}/${fileSize}`,
		      		'Accept-Ranges': 'bytes',
		      		'Content-Length': chunkSize,
		      		'Content-Type': 'video/mp4'
				}

				res.writeHead(206, head);
				file.pipe(res);
			} else {
				const head = {
					'Content-Length': fileSize,
					'Content-Type': 'video/mp4'
				}
				res.writeHead(200, head);
				fs.createReadStream(path).pipe(res);
			}
		
		}
	});
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next;
    }
    res.redirect("/login");
}

module.exports = router;