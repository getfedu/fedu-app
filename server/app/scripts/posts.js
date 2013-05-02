// CRUD - Backend Posts
///////////////////////////////////////////////////////////
'use strict';

var mongodb = require('mongodb');
var moment = require('moment');

module.exports = function(app, collectionPosts, collectionTags, collectionNotifications, collectionUser, saltKey){
    var helpers = require('./helpers.js')(collectionTags);
    var auth = require('./auth.js')(saltKey, collectionUser);
    // Create Post and save into db
    app.post('/post', function(req, res) {
        collectionPosts.insert(req.body, function() {
            helpers.checkTags.init(req.body.tags, true);
            res.json('ok');
        });
    });

    // Read Posts from db
    app.get('/post', function(req, res) {
        var top = parseInt(req.query.top, 0);
        var skip = parseInt(req.query.skip, 0);
        collectionPosts.find().skip(skip).limit(top).sort({ _id: -1}).toArray(function(err, results){
            res.json(results);
        });
    });

    // Read a single Post from db
    app.get('/post/:id', function(req, res) {
        if(req.params.id.length === 24){
            var BSON = mongodb.BSONPure;
            var oId = new BSON.ObjectID(req.params.id);
            collectionPosts.find({'_id': oId }).toArray(function(err, results){
                res.json(results);
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
            collectionPosts.findOne({'_id': oId }, function(err, result){
                helpers.checkTags.init(result.tags, false);
            });
            collectionPosts.update({'_id': oId }, req.body, function(){
                helpers.checkTags.init(req.body.tags, true);
                res.json('ok');
            });
        }
    });

    // Delete Post in db
    app.delete('/post/:id', function(req, res) {
        var BSON = mongodb.BSONPure;
        var oId = new BSON.ObjectID(req.params.id);
        collectionPosts.findOne({'_id': oId }, function(err, result){
            helpers.checkTags.init(result.tags, false);
        });
        collectionPosts.remove({'_id': oId }, function(){
            res.json('ok');
        });
    });

    app.post('/post/favorite', auth.isAuth, function(req, res) {
        var postId = req.body.postId;
        var userId = req.user._id;
        collectionUser.findAndModify({'_id': userId}, [['_id','asc']], { $push: { favoritePosts: postId }}, {}, function() {
            res.json('ok');
        });
    });
};