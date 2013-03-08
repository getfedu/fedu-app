'use strict';
var express = require('../../node_modules/express');
var mongodb = require('../../node_modules/mongodb');
var oAuth = require('../../node_modules/oauth').OAuth;
var request = require('../../node_modules/request');
var app = null;
var oa = null;
var collectionPosts = {};

// db handling
///////////////////////////////////////////////////////////
function dbConnector(){
    mongodb.connect('mongodb://localhost/fedu', function(err, db) {
        if(err){
            throw err;
        }

        console.log('connected');
        collectionPosts = db.collection('posts');

    });

}

// init
///////////////////////////////////////////////////////////
function init(){
    // init db
    dbConnector();

    // init express
    app = express();
    app.use(express.bodyParser());
    app.all('*', function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE, PUT');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
        next();
    });

    oa = new oAuth(
        'http://twitter.com/oauth/request_token',
        'http://twitter.com/oauth/access_token',
        'y127hdBETk3KoJrzQdmw', '9zUx9bK9cFbjqh6bSnvNG7J8uDX9YrCS1h8XvLGYY',
        '1.0A', null, 'HMAC-SHA1'
    );

}

init();

// request/response handling
///////////////////////////////////////////////////////////

app.post('/post', function(req, res) {
    // console.log('server - post - addVideo');
    collectionPosts.insert(req.body, function() {
        res.send(JSON.stringify('OK'));
    });
});

app.delete('/post/:id', function(req, res) {
    var BSON = mongodb.BSONPure;
    var oId = new BSON.ObjectID(req.params.id);
    collectionPosts.remove({'_id': oId }, function() {
        res.send(JSON.stringify('OK'));
    });
});

app.put('/post/:id', function(req, res) {
    var BSON = mongodb.BSONPure;
    var oId = new BSON.ObjectID(req.params.id);
    delete req.body._id;

    collectionPosts.update({'_id': oId }, req.body, function(){
        res.send(JSON.stringify('OK'));
    });

});

app.get('/get/:value', function(req, res) {
    var results = [];
    var collection = {};

    if(req.params.value === 'posts'){
        collection = collectionPosts;
    }

    var query = collection.find().stream();
    query.on('data', function(item) {
        results.push(item);
    });

    query.on('end', function() {
        res.setHeader('Content-Type', 'application/json');
        res.send(results);
    });
});

app.get('/old_tweets', function(req, res) {
    var theTweets = [];
    var allTweets = {
        'theTweets': theTweets,
        'old': true
    };
    var counter = 0;

    var queryTweets = collection.find().sort( { max_id: -1 } ).stream();

    queryTweets.on('data', function(item) {
        theTweets.push(item);
        counter++;
    });

    queryTweets.on('end', function() {
        res.setHeader('Content-Type', 'application/json');
        allTweets.count = counter;
        res.send(allTweets);
    });
});

app.get('/tweet/:hashtag', function(req, res) {
    oa.get('https://api.twitter.com/1.1/search/tweets.json?q=%23' + req.params.hashtag + '&lang=en&result_type=recent&since_id=' + lastTweetId + '&count=3', '155494201-Errz5Sd3TQQzeXYnr75RXaymFHFlyIfbTZK3XQwJ', 'SX3thT8nwek6cGAYzgilQ3wnbaYbq6A7yS9EqJlI8Y', function(error, data) {
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
        var dataAsJson = JSON.parse(data);
        lastTweetId = dataAsJson.search_metadata.max_id_str;
    });
});

app.post('/save', function(req, res) {
    var tweet = {
        author: req.body.author,
        title: req.body.title,
        date: req.body.date,
        max_id: req.body.max_id,
        timestamp: req.body.timestamp
    };
    collection.insert(tweet, function() {
        res.send(JSON.stringify(res.headers));
    });
});

app.get('/all_tweets', function(req, res){
    var theTweets = [];
    var allTweets = {
        'theTweets': theTweets
    };
    var counter = 0;

    var queryTweets = collection.find().stream();

    queryTweets.on('data', function(item) {
        theTweets.push(item);
        counter++;
    });

    queryTweets.on('end', function() {
        res.setHeader('Content-Type', 'application/json');
        allTweets.count = counter;
        res.send(allTweets);
    });
});

app.options('/*', function(req, res) {
    res.send(JSON.stringify(res.headers));
});

app.post('/test', function(req, res) {
    console.log('request POST: /test');
    res.send('request POST: /test/id');
});


app.post('/api-call', function(req, res){

    var optionsVideo = {
        url: 'https://www.googleapis.com/youtube/v3/videos/?id='+ req.body.id +'&key=' + req.body.key + '&part=snippet,contentDetails,statistics,status'
    };

    request(optionsVideo, function (error, response, videoData) {
        if (!error && response.statusCode === 200) {

            videoData = JSON.parse(videoData);
            var optionsCategory = {
                url: 'https://www.googleapis.com/youtube/v3/videoCategories?part=snippet&id=' + videoData.items[0].snippet.categoryId + '&key=' + req.body.key
            };

            request(optionsCategory, function (error, response, categoryData) {
                if (!error && response.statusCode === 200) {
                    categoryData = JSON.parse(categoryData);
                    res.send({ videoData: videoData, categoryData: categoryData });
                } else {
                    console.log(error);
                }
            });
        } else {
            console.log(error);
        }
    });
});

// server listen on port X
///////////////////////////////////////////////////////////
app.listen(3100);