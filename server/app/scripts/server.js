'use strict';
var express = require('../../node_modules/express');
var mongodb = require('../../node_modules/mongodb').MongoClient;
var oAuth = require('../../node_modules/oauth').OAuth;
var app = null;
var oa = null;
var lastTweetId = 0;
var collectionVideo = {};

// db handling
///////////////////////////////////////////////////////////
function dbConnector(){
    mongodb.connect('mongodb://localhost/fedu', function(err, db) {
        if(err){
            throw err;
        }

        console.log('connected');
        collectionVideo = db.collection('video');

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
        res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
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

app.get('/test', function(req, res) {
    res.send('dd');
});

app.get('/test/:id', function(req, res) {
    //mongoose.set(req.params.id, req.params.id)
    console.log('request GET: /test/id' + req.params.id);
    res.send(req.params.id);
});

app.post('/add-post', function(req, res) {
    // console.log('server - post - addVideo');
    var post = {
        title: req.body.title,
        videoUrl: req.body.videoUrl,
        description: req.body.description,
    };
    collectionVideo.insert(post, function() {
        res.send(JSON.stringify('200')); // success = 200
    });
});

app.get('/get-videos', function(req, res) {
    var theVideos = [];
    var queryVideos = collectionVideo.find().stream();

    queryVideos.on('data', function(item) {
        theVideos.push(item);
    });

    queryVideos.on('end', function() {
        res.setHeader('Content-Type', 'application/json');
        res.send(theVideos);
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

// server listen on port X
///////////////////////////////////////////////////////////
app.listen(3100);