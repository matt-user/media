var mongoose = require("mongoose");
var Video = require("./models/video");
var Series = require("./models/series");

var data = [
	{
		title: "Samurai Jack",
		thumbnail: "http://i.cdn.turner.com/adultswim/big/video/shrinking-showdown/rickandmorty_ep310_001_Shrinking_In_Brazil.jpg",
		numSeasons: 5
	},
	{
		title: "Rick and Morty",
		thumbnail: "http://i.cdn.turner.com/adultswim/big/video/shrinking-showdown/rickandmorty_ep310_001_Shrinking_In_Brazil.jpg",
		numSeasons: 3,
	},
	{
		title: "Brooklyn 99",
		thumbnail: "http://i.cdn.turner.com/adultswim/big/video/shrinking-showdown/rickandmorty_ep310_001_Shrinking_In_Brazil.jpg",
		numSeasons: 5
	}
];

function seedDB(){
   //Remove all series
   Series.remove({}, function(err){
        if(err){
            console.log(err);
        }
        console.log("removed series!");
        Video.remove({}, function(err) {
            if(err){
                console.log(err);
            }
            console.log("removed videos!");
            //  //add a few series
            // data.forEach(function(seed){
            //     Series.create(seed, function(err, series){
            //         if(err){
            //             console.log(err)
            //         } else {
            //             console.log("added a series");
            //             //create a video
            //             Video.create(
            //                 {
            //                     name: "Rick and Morty",
            //                     thumbnail: "http://i.cdn.turner.com/adultswim/big/video/shrinking-showdown/rickandmorty_ep310_001_Shrinking_In_Brazil.jpg",
            //                     video: __dirname + "/media/video/shows/test.mp4",
            //                     description: "Stock Video"
            //                 }, function(err, video){
            //                     if(err){
            //                         console.log(err);
            //                     } else {
            //                         series.videos.push(video);
            //                         series.save();
            //                         console.log("Created new video");
            //                     }
            //                 });
            //         }
            //     });
            //});
        });
     }); 
}

module.exports = seedDB;