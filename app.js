var express    = require("express"),
    app        = express(),
    bodyParser = require("body-parser"),
    mongoose   = require("mongoose"),
    passport   = require("passport"),
    LocalStrategy = require("passport-local"),
    fs         = require("fs"),
    path       = require("path"),
    seedDB     = require("./seeds"),
    User       = require("./models/user"),
    Series     = require("./models/series"),
    Video      = require("./models/video"),
    Movies     = require("./models/movie");
 var passportLocalMongoose = require("passport-local-mongoose");

var videoRoutes = require("./routes/video"),
    indexRoutes = require("./routes/index");

var PORT = 80;

mongoose.connect("mongodb://localhost/media_app");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static(path.join(__dirname, "/media/images")));

//seedDB();

//passport configuration
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
});

//It would be nice to put all of these routes into separate files like I have in the routes folder
//but I can't because the function that plays the videos needs to find the media

function isLoggedIn(req, res, next){
	console.log("in logged");
    if(req.isAuthenticated()){
    	console.log("in if");
        return next();
    }
    console.log("out if");
    res.redirect("/login");
}

app.get("/movies", isLoggedIn, function(req, res){
	Movies.find({}, function(err, allMovies){
		if(err){
			console.log(err);
		} else {
			console.log(allMovies);
			res.render("video/movieIndex", {movies: allMovies});
		}
	});
});

app.get("/movies/new", isLoggedIn, function(req, res){
	res.render("video/newMovie");
});

app.post("/movies", isLoggedIn, function(req, res){
	var name = req.body.name;
	var thumbnail = req.body.thumbnail;
	var video = req.body.video;
	var description = req.body.description;
	var newMovie = {name: name, thumbnail: thumbnail, video: video, description: description};
	console.log(newMovie);
	Movies.create(newMovie, function(err, newlyCreated){
		if(err){
			console.log("Error" + err);
		} else {
			console.log(newlyCreated);
			res.redirect("/movies");
		}
	});
});

app.get("/movies/:id", isLoggedIn, function(req, res){
	Movies.findById(req.params.id, function(err, foundVideo){
		if(err){
			console.log(err);
		} else {
			console.log(foundVideo + "in show route");
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

//index route
app.get("/videos", isLoggedIn, function(req, res){
	Series.find({}, function(err, allSeries){
		if(err){
			console.log(err);
		} else {
			console.log(allSeries);
			res.render("video/index", {series: allSeries});
		}
	});
});

//new series route
app.get("/videos/series/new", isLoggedIn, function(req, res){
	res.render("video/newSeries");
});

//show series route
app.get("/videos/series/:id", isLoggedIn, function(req, res){
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
app.post("/videos", isLoggedIn, function(req, res){
	var title = req.body.title;
	var thumbnail = req.body.thumbnail;
	console.log(thumbnail);
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
app.post("/videos/series/:id/episode", isLoggedIn, function(req, res) {
	Series.findById(req.params.id, function(err, series){
		if(err){
			console.log(err);
		} else {
			Video.create(req.body.video, function(err, video){
				console.log(video + "in post route");
				video.save();
				series.videos.push(video);
				series.save();
				res.redirect("/videos");
			});
		}
	});
});

//new episode route
app.get("/videos/series/:id/episode/new", isLoggedIn, function(req, res){
	Series.findById(req.params.id, function(err, series){
		if(err){
			console.log(err);
		} else {
			res.render("video/new", {series: series});
		}
	});
});

//show route
app.get("/videos/:id", isLoggedIn, function(req, res){
	Video.findById(req.params.id).exec(function(err, foundVideo){
		if(err){
			console.log(err);
		} else {
			console.log(foundVideo + "in show route");
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


app.get("/", isLoggedIn, function(req, res){
	console.log("landing")
	res.render("landing");
});

app.get("/register", function(req, res) {
   res.render("register"); 
});

app.post("/register", function(req, res) {
   User.register(new User({username: req.body.username}), req.body.password, function(err, user){
   		console.log("in callback")
   		if(err){
   			console.log(err);
   			return res.render("register");
   		}
   		passport.authenticate("local")(req, res, function(){
   			console.log("in authenticate");
   			res.redirect("/");
   		});
   });
});

app.get("/login", function(req, res) {
   console.log("login");
   res.render("login"); 
});

app.post("/login", passport.authenticate('local',
    {
        successRedirect: "/",
        failureRedirect: "/login"
        
    }), function(req, res) {
		console.log("in login callback");
});

app.listen(PORT, function(){
	console.log("server started on port " + PORT);
});