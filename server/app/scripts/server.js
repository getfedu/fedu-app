'use strict';
var express = require('../../node_modules/express');
var mongodb = require('../../node_modules/mongodb');
var request = require('../../node_modules/request');
var moment = require('../../node_modules/moment');
require('../../node_modules/moment-isoduration');
require('../../node_modules/socket.io');
// var removeDiacritics = require('diacritics').remove;

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var app = null;
var appSocketIo = null;
var socketIo = null;
var collectionPosts = {};
var collectionTags = {};
var collectionNotifications = {};
var collectionUser = {};
var store  = new express.session.MemoryStore;

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
            collectionNotifications = db.collection('notifications');
            collectionUser = db.collection('user');

        });
    },

    express: function(){
        app = express();
        app.configure(function() {
            app.use(express.static('public'));
            app.use(express.cookieParser());
            app.use(express.bodyParser());
            // app.use(express.cookieSession({ secret: 'keyboard cato', cookie: { path: '/', httpOnly: true, maxAge: null }}));
            app.use(express.session(({ secret: 'keyboard cat', key: 'sid', store: this.store })));
            app.use(passport.initialize());
            app.use(passport.session());
            app.use(app.router);
        });
        app.all('*', function(req, res, next) {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE, PUT');
            res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
            next();
        });
    },

    socketIo: function(){
        appSocketIo = express();
        var serverSocketIo = require('http').createServer(appSocketIo);
        socketIo = require('socket.io').listen(serverSocketIo);
        socketIo.set('log level', 1);
        serverSocketIo.listen(4321);
    }
};

init.db();
init.express();
init.socketIo();

// Passport
///////////////////////////////////////////////////////////

passport.use(new LocalStrategy(
    function(username, password, done) {
        collectionUser.findOne({ username: username }, function(err, user) {
            if(err){
                return done(err);
            }
            if(!user){
                return done(null, false, { message: 'Incorrect username.' });
            }
            if(user.password !== password){
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(_id, done) {
    collectionUser.findById(_id, function(err, user) {
        done(err, user);
    });
});

app.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user) {
        if (err) {
            return next(err);
        }
        if (!user) {
            res.status(401);
            res.send('Authorization failed!');
            return;
        }
        req.logIn(user, function(err) {
            if (err) {
                return next(err);
            }
            console.log(req.sessionStore);
            console.log(store);
            res.send('Authorization succeeded!');
            return;
        });
    })(req, res, next);
});

app.post('/logout', function(req, res){
    var BSON = mongodb.BSONPure;
    req.user = { _id: new BSON.ObjectID(req.params.userId) };
    if(req.isAuthenticated){
        req.logout();
        req.session = null;
        res.send('logged out');
    } else {
        res.status(401);
        res.send('Unauthroized!');
    }
});

app.get('/account', function(req, res){
    res.send(req.user);
});

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

    collectionPosts.find().skip(skip).limit(top).sort({ _id: -1}).toArray(function(err, results){
        res.setHeader('Content-Type', 'application/json');
        res.send(results);
    });

});

// Read a single Post from db
app.get('/post/:id', function(req, res) {
    if(req.params.id.length === 24){
        var BSON = mongodb.BSONPure;
        var oId = new BSON.ObjectID(req.params.id);
        collectionPosts.find({'_id': oId }).toArray(function(err, results){
            res.setHeader('Content-Type', 'application/json');
            res.send(results);
        });
    }

});

// Update Post in db
app.put('/post/:id', function(req, res) {
    var BSON = mongodb.BSONPure;
    var oId = new BSON.ObjectID(req.params.id);
    var pullRequestId = new BSON.ObjectID(req.body.pullRequestId);

    delete req.body._id;

    if(req.body.pullRequestTitle){
        var data = {};

        collectionPosts.findOne({'_id': oId }, function(err, result){

            if(!result.additionalInfo){ // check if additonalInfo already exists and add the info to the post

                data = {
                    $set: {
                        updateDate: moment().format(),
                        additionalInfo: [{
                            pullRequestTitle: req.body.pullRequestTitle,
                            pullRequestUrl: req.body.pullRequestUrl,
                            pullRequestPublishDate: moment().format()
                        }]
                    }
                };

            } else { // add additionalInfo to post
                data = {
                    $set: {
                        updateDate: moment().format(),
                    },
                    $push:{
                        additionalInfo: {
                            pullRequestTitle: req.body.pullRequestTitle,
                            pullRequestUrl: req.body.pullRequestUrl,
                            pullRequestPublishDate: moment().format()
                        }
                    }
                };

            }

            // update post
            collectionPosts.update({'_id': oId }, data, function(){
                res.send(JSON.stringify('OK'));
            });

            // update notification
            data = {
                $set: {
                    updateDate: req.body.updateDate,
                    checked: true
                }
            };

            collectionNotifications.update({'_id': pullRequestId }, data);

        });

    } else {
        console.log(req.body);
        collectionPosts.findOne({'_id': oId }, function(err, result){
            checkTags.init(result.tags, false);
        });
        collectionPosts.update({'_id': oId }, req.body, function(){
            checkTags.init(req.body.tags, true);
            res.send(JSON.stringify('OK'));
        });
    }
});

// Delete Post in db
app.delete('/post/:id', function(req, res) {
    var BSON = mongodb.BSONPure;
    var oId = new BSON.ObjectID(req.params.id);
    collectionPosts.findOne({'_id': oId }, function(err, result){
        checkTags.init(result.tags, false);
    });
    collectionPosts.remove({'_id': oId }, function(){
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

// Read Tags from db
app.get('/tag', function(req, res) {

    collectionTags.find().sort({ counter: -1}).toArray(function(err, results){
        res.setHeader('Content-Type', 'application/json');
        res.send(results);
    });

});

app.put('/tag/:id', function(req, res) {
    var BSON = mongodb.BSONPure;
    var oId = new BSON.ObjectID(req.params.id);
    delete req.body._id;
    collectionTags.update({'_id': oId }, req.body, function(){
        res.send(JSON.stringify('OK'));
    });
});


// Search
///////////////////////////////////////////////////////////

var search = {

    generateTitleObject: function(query){
        var titleObject = {};
        var titleArray = [];
        titleObject.$and = titleArray;
        if(query.query){
            var split = query.query.split(' ');
            for (var i = 0; i < split.length; i++) {
                var obj = {};
                obj.title = {};
                obj.title.$regex = '^.*' + split[i] + '.*$';
                obj.title.$options = 'i';
                titleArray.push(obj);
            }
        }

        return titleObject;
    },

    generateDurationObject: function(query){
        var durationObject = {};
        if(query.duration){
            durationObject = {
                'foreign.duration': {
                    '$gte': parseInt(query.duration, 10) - 300,
                    '$lte': parseInt(query.duration, 10) + 300
                }
            };
        }

        return durationObject;
    },

    generateQuery: function(query){
        var titleObject = this.generateTitleObject(query);
        var durationObject = this.generateDurationObject(query);

        var queryObj = {};
        if(query.query && query.duration && !query.tag){
            queryObj = { $and: [durationObject, titleObject]};
        } else if(query.tag && query.duration && !query.query){
            queryObj =  { $and: [durationObject, { tags: query.tag }] };
        } else if(query.query && query.tag && query.duration){
            queryObj =  { $and: [durationObject, { tags: query.tag }, titleObject] };
        } else if(query.tag && query.query){
            queryObj =  { $and: [{ tags: query.tag }, titleObject] };
        } else if(query.query && !query.tag) {
            queryObj = { $or: [{ tags: query.query }, titleObject] };
        } else if(query.tag && !query.query) {
            queryObj = { tags: query.tag };
        }
        return queryObj;
    }
};

// Search Posts in db
app.get('/search', function(req, res) {

    var queryObj = search.generateQuery(req.query);
    var skip = parseInt(req.query.skip, 0);
    var top = parseInt(req.query.top, 0);

    collectionPosts.find(queryObj).skip(skip).limit(top).sort({ _id: -1}).toArray(function(err, results){
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
                parsedData.tags = apiData.tags;
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

// notification
///////////////////////////////////////////////////////////
app.get('/flag-post', function(req, res) {
    var data = {
        id: req.query.id,
        type: req.query.type,
        title: req.query.title,
        description: req.query.description,
        checked: false,
        publishDate: moment().format(),
        updateDate: moment().format(),
    };
    collectionNotifications.insert(data, function(err, result) {
        data.pullRequestId = result[0]._id;
        socketIo.sockets.emit ('notify-post', data); // websocket
        res.send(JSON.stringify('OK'));
    });


});

app.get('/pull-request', function(req, res) {
    var data = {
        id: req.query.id,
        type: req.query.type,
        title: req.query.title,
        description: req.query.description,
        pullRequestTitle: req.query.pullRequestTitle,
        pullRequestUrl: req.query.pullRequestUrl,
        checked: false,
        publishDate: moment().format(),
        updateDate: moment().format()
    };
    collectionNotifications.insert(data, function(err, result) {
        data.pullRequestId = result[0]._id;
        socketIo.sockets.emit('notify-post', data); // websocket
        res.send(JSON.stringify('OK'));
    });


});

app.get('/notification', function(req, res) {
    if(req.query.filter === 'all'){
        collectionNotifications.find().sort({'_id': -1}).toArray(function(err, results){
            res.setHeader('Content-Type', 'application/json');
            res.send(results);
        });

    } else if(req.query.filter === 'partial'){
        collectionNotifications.find({ checked: false}).limit(3).sort({ _id: -1}).toArray(function(err, results){
            res.setHeader('Content-Type', 'application/json');
            res.send(results);
        });

    } else if(req.query.filter === 'countUnchecked'){
        collectionNotifications.find({ checked: false}).count(function(e, count){
            res.setHeader('Content-Type', 'application/json');
            var object = {uncheckedNotifications: count};
            res.send(object);
        });

    }

});

app.get('/notification/:id', function(req, res) {
    var queryObj = {
        $and : [
            {id: req.params.id},
            {type: 'pull-request'},
            {checked: false}
        ]
    };

    collectionNotifications.find(queryObj).sort({ _id: -1}).toArray(function(err, results){
        res.setHeader('Content-Type', 'application/json');
        res.send(results);
    });

});

app.put('/notification/:id', function(req, res) {
    var BSON = mongodb.BSONPure;
    var oId = new BSON.ObjectID(req.params.id);
    var body = {};

    if(req.body.description === ''){
        body = {
            $set: {
                updateDate: req.body.updateDate,
                checked: req.body.checked
            }
        };
    } else {
        body = req.body;
    }

    delete req.body._id;
    collectionNotifications.update({'_id': oId }, body, function(){
        res.send(JSON.stringify('OK'));
    });

});

// server listen on port X
///////////////////////////////////////////////////////////
app.listen(3100);