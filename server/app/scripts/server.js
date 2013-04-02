'use strict';
var express = require('../../node_modules/express');
var mongodb = require('../../node_modules/mongodb');
var request = require('../../node_modules/request');
var moment = require('../../node_modules/moment');
require('../../node_modules/moment-isoduration');
var app = null;
var collectionPosts = {};
var collectionTags = {};

// init
///////////////////////////////////////////////////////////
var init = {

    db: function(){
        mongodb.connect('mongodb://localhost/fedu', function(err, db) {
            if(err){
                throw err;
            }

            console.log('connected');
            collectionPosts = db.collection('posts');
            collectionTags = db.collection('tags');

        });
    },

    express: function(){
        app = express();
        app.use(express.bodyParser());
        app.all('*', function(req, res, next) {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE, PUT');
            res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
            next();
        });
    }
};

init.db();
init.express();

// Helper Functions
///////////////////////////////////////////////////////////

var checkTags = {
    init: function(tags, increaseOrDecrease){ // true = increase, false = decrease
        if(tags.length > 0){
            for (var i = 0; i < tags.length; i++){
                this.queryTags(tags[i], increaseOrDecrease);
            }
        }
    },

    queryTags: function(value, increaseOrDecrease){
        var that = this;
        collectionTags.findOne({tagName: value}, function(err, result){
            if(result){
                if(increaseOrDecrease) {
                    that.increaseCounter(result);
                } else {
                    that.decreaseCounter(result);
                }
            } else {
                that.addTag(value);
            }
        });
    },

    increaseCounter: function(result){
        result.counter = result.counter + 1;
        collectionTags.update({'_id': result._id }, result);
    },

    decreaseCounter: function(result){
        result.counter = result.counter - 1;
        collectionTags.update({'_id': result._id }, result);
    },

    addTag: function(value){

        var tag = {
            tagName: value,
            description: '',
            counter: 1,
            createDate: moment().format(),
            updateDate: moment().format()
        };

        collectionTags.insert(tag);
    }
};

//General Options-Handler (no use atm)
app.options('/*', function(req, res) {
    res.send(JSON.stringify(res.headers));
});

// CRUD - Backend Posts
///////////////////////////////////////////////////////////

// Create Post and save into db
app.post('/post', function(req, res) {
    collectionPosts.insert(req.body, function() {
        checkTags.init(req.body.tags, true);
        res.send(JSON.stringify('OK'));
    });
});


// Read Posts from db
app.get('/post', function(req, res) {
    var top = parseInt(req.query.top, 0);
    var skip = parseInt(req.query.skip, 0);
    var results = [];
    var query = '';

    query = collectionPosts.find().skip(skip).limit(top).sort({ _id: 1}).stream();

    query.on('data', function(item) {
        results.push(item);
    });

    query.on('end', function() {
        res.setHeader('Content-Type', 'application/json');
        res.send(results);
    });

});

// Read a single Post from db
app.get('/post/:id', function(req, res) {
    var results = [];
    var query = '';

    if(req.params.id.length === 24){
        var BSON = mongodb.BSONPure;
        var oId = new BSON.ObjectID(req.params.id);
        query = collectionPosts.find({'_id': oId }).stream();

        query.on('data', function(item) {
            results.push(item);
        });

        query.on('end', function() {
            res.setHeader('Content-Type', 'application/json');
            res.send(results);
        });
    }
});

// Update Post in db
app.put('/post/:id', function(req, res) {
    var BSON = mongodb.BSONPure;
    var oId = new BSON.ObjectID(req.params.id);
    delete req.body._id;

    collectionPosts.update({'_id': oId }, req.body, function(){
        res.send(JSON.stringify('OK'));
    });

});

// Delete Post in db
app.delete('/post/:id', function(req, res) {
    var BSON = mongodb.BSONPure;
    var oId = new BSON.ObjectID(req.params.id);
    collectionPosts.findOne({'_id': oId }, function(err, result){
        checkTags.init(result.tags, false);
    });
    collectionPosts.remove({'_id': oId }, function() {
        res.send(JSON.stringify('OK'));
    });
});

// CRUD - Backend Tags
///////////////////////////////////////////////////////////

// Create Tags and save into db
app.post('/tag', function(req, res) {
    collectionTags.insert(req.body, function() {
        res.send(JSON.stringify('OK'));
    });
});

// Read Posts from db
app.get('/tag', function(req, res) {
    var results = [];
    var query = '';

    query = collectionTags.find().stream();

    query.on('data', function(item) {
        results.push(item);
    });

    query.on('end', function() {
        res.setHeader('Content-Type', 'application/json');
        res.send(results);
    });

});

// API Section - Backend
///////////////////////////////////////////////////////////

app.post('/api-call', function(req, res){

    var optionsVideo = {};

    if(req.body.type === 'youtube'){
        optionsVideo.url = 'https://www.googleapis.com/youtube/v3/videos/?id=' + req.body.id + '&key=' + req.body.key + '&part=snippet,contentDetails,statistics,status';
    } else if(req.body.type === 'vimeo') {
        optionsVideo.url = 'http://vimeo.com/api/v2/video/' + req.body.id + '.json';
    } else {
        res.send(500);
    }

    var parsedData = {};

    request(optionsVideo, function (error, response, apiData) {
        apiData = JSON.parse(apiData);
        if (req.body.type === 'vimeo') {
            apiData = apiData[0];
            if(response.statusCode === 200) {
                parsedData.title = apiData.title;
                parsedData.description = apiData.description;
                parsedData.tags = ''; //apiData.tags;
                parsedData.foreign = {};
                parsedData.foreign.embedUrl = 'http://player.vimeo.com/video/' + apiData.id;
                parsedData.foreign.uploadDate = moment(apiData.upload_date).format();
                parsedData.foreign.duration = apiData.duration;
                parsedData.foreign.thumbnail = {};
                parsedData.foreign.thumbnail.small = apiData.thumbnail_small;
                parsedData.foreign.thumbnail.medium = apiData.thumbnail_medium;
                parsedData.foreign.thumbnail.large = apiData.thumbnail_large;
                parsedData.foreign.channelId = apiData.user_id;
                parsedData.foreign.channelName = apiData.user_name;
                parsedData.foreign.likeCount = apiData.stats_number_of_likes;
                parsedData.foreign.playCount = apiData.stats_number_of_plays;
                parsedData.foreign.commentCount = apiData.stats_number_of_comments;
                parsedData.foreign.caption = false;

                res.send(parsedData);
            } else {
                res.status(204);
                res.send('no content');
            }

        } else if (req.body.type === 'youtube'){
            if(apiData.items.length > 0){
                apiData = apiData.items[0];
                parsedData.title = apiData.snippet.title;
                parsedData.description = apiData.snippet.description;
                parsedData.tags = '';
                parsedData.foreign = {};
                parsedData.foreign.embedUrl = 'http://www.youtube.com/embed/' + apiData.id;
                parsedData.foreign.uploadDate = moment(apiData.snippet.publishedAt).format();
                parsedData.foreign.duration = moment.duration.fromIsoduration(apiData.contentDetails.duration).asSeconds();
                parsedData.foreign.thumbnail = {};
                parsedData.foreign.thumbnail.small = apiData.snippet.thumbnails.default.url;
                parsedData.foreign.thumbnail.medium = apiData.snippet.thumbnails.medium.url;
                parsedData.foreign.thumbnail.large = apiData.snippet.thumbnails.high.url;
                parsedData.foreign.channelId = apiData.snippet.channelId;
                parsedData.foreign.channelName = apiData.snippet.channelTitle;
                parsedData.foreign.likeCount = apiData.statistics.likeCount;
                parsedData.foreign.playCount = apiData.statistics.viewCount;
                parsedData.foreign.commentCount = apiData.statistics.commentCount;
                parsedData.foreign.caption = apiData.contentDetails.caption;

                res.send(parsedData);
            } else {
                res.status(204);
                res.send('no content');
            }
        }
    });
});

// server listen on port X
///////////////////////////////////////////////////////////
app.listen(3100);