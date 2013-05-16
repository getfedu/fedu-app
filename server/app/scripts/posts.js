// CRUD - Backend Posts
///////////////////////////////////////////////////////////
'use strict';

var mongodb = require('mongodb');
var moment = require('moment');

module.exports = function(app, collectionPosts, collectionTags, collectionNotifications, collectionUser, saltKey){
    var helpers = require('./helpers.js')(collectionTags);
    var auth = require('./auth.js')(saltKey, collectionUser);

    // Create Post and save into db
    app.post('/post', auth.isAuth, function(req, res) {
        collectionPosts.insert(req.body, function(err, docs) {
            helpers.checkTags.init(req.body.tags, true);
            postHelpers.addRatingStructure(docs[0]._id);
            res.json('ok');
        });
    });

    // Read Posts from db
    app.get('/post', function(req, res) {

        var top = parseInt(req.query.top, 0);
        var skip = parseInt(req.query.skip, 0);
        var thePosts = [];
        var posts = collectionPosts.find().skip(skip).limit(top).sort({ _id: -1}).stream();
        posts.on('data', function(item) {
            posts.pause(); // pause stream until data is manipulated
            collectionTags.find({ tagName: { $in: item.tags } }).toArray(function(err, tag_results){
                item.tags = tag_results;
                thePosts.push(item);
                posts.resume();
            });
        });
        posts.on('end', function(){
            res.json(thePosts);
        });
    });

    // Read a single Post from db
    app.get('/post/:id', function(req, res) {
        if(req.params.id.length === 24){
            var BSON = mongodb.BSONPure;
            var oId = new BSON.ObjectID(req.params.id);
            collectionPosts.find({'_id': oId }).toArray(function(err, results){
                collectionTags.find({ tagName: { $in: results[0].tags } }).toArray(function(err, tag_results){
                    results[0].tags = tag_results;
                    res.json(results);
                });
            });
        }
    });

    // Update Post in db
    app.put('/post/:id', auth.isAuth, function(req, res) {
        var BSON = mongodb.BSONPure;
        var oId = new BSON.ObjectID(req.params.id);
        var pullRequestId = new BSON.ObjectID(req.body.pullRequestId);
        delete req.body._id;

        if(req.body.pullRequestTitle){
            postHelpers.pullRequest(req, res, collectionPosts, oId, pullRequestId);
        } else {
            collectionPosts.findOne({'_id': oId }, function(err, result){
                postHelpers.comparePostsTags(req.body.tags, result.tags);
            });
            collectionPosts.update({'_id': oId }, req.body, function(){
                res.json('ok');
            });
        }
    });

    // Delete Post in db
    app.delete('/post/:id', auth.isAuth, function(req, res) {
        var BSON = mongodb.BSONPure;
        var oId = new BSON.ObjectID(req.params.id);
        collectionPosts.findOne({'_id': oId }, function(err, result){
            helpers.checkTags.init(result.tags, false);
        });
        collectionPosts.remove({'_id': oId }, function(){
            res.json('ok');
        });
    });

    app.post('/post-add-favorite', auth.isAuth, function(req, res) {
        var postId = req.body.postId;
        var userId = req.user._id;
        collectionUser.findAndModify({'_id': userId}, [['_id','asc']], { $push: { favoritePosts: postId }}, {}, function() {
            res.json('ok');
        });
    });

    app.post('/post-remove-favorite', auth.isAuth, function(req, res) {
        var postId = req.body.postId;
        var userId = req.user._id;
        collectionUser.findAndModify({'_id': userId}, [['_id','asc']], { $pull: { favoritePosts: postId }}, {}, function() {
            res.json('ok');
        });
    });

    app.get('/post-list-favorite', auth.isAuth, function(req, res) {
        var idArray = req.user.favoritePosts;
        if(idArray !== undefined && idArray.length > 0){
            var query = [];
            var BSON = mongodb.BSONPure;
            for (var i = 0; i < idArray.length; i++) {
                var id = new BSON.ObjectID(idArray[i]);
                query.push(id);
            }
            var thePosts = [];
            var posts = collectionPosts.find({ '_id' : { $in: query}}).sort({ _id: -1}).stream();
            posts.on('data', function(item) {
                posts.pause(); // pause stream until data is manipulated
                collectionTags.find({ tagName: { $in: item.tags } }).toArray(function(err, tag_results){
                    item.tags = tag_results;
                    thePosts.push(item);
                    posts.resume();
                });
            });
            posts.on('end', function(){
                res.json(thePosts);
            });
        } else {
            res.status(204);
            res.json('no favorites');
        }
    });

    app.post('/post-rate', auth.isAuth, function(req, res) {
        var postId = req.body.id;
        var BSON = mongodb.BSONPure;
        var oId = new BSON.ObjectID(postId);

        postHelpers.rating(req, res, collectionUser, collectionPosts, oId, postId);
    });

    var postHelpers = {
        pullRequest: function(req, res, collectionPosts, oId, pullRequestId){
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
                    res.json('ok');
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
        },

        rating: function(req, res, collectionUser, collectionPosts, oId, postId){
            collectionPosts.findOne({'_id': oId }, function(err, result){
                var data = {};

                var newTotalUsers = result.rating.totalUsers + 1;

                var newQualityExact = ((result.rating.quality.exact * result.rating.totalUsers) + parseInt(req.body.quality, 0)) / newTotalUsers;
                newQualityExact = parseFloat(newQualityExact.toFixed(2));
                var newQualityRounded = Math.round(newQualityExact);

                var newComprehensibilityExact = ((result.rating.comprehensibility.exact * result.rating.totalUsers) + parseInt(req.body.comprehensibility, 0)) / newTotalUsers;
                newComprehensibilityExact = parseFloat(newComprehensibilityExact.toFixed(2));
                var newComprehensibilityRounded = Math.round(newComprehensibilityExact);

                var newTotalPointsExact =  (newQualityExact + newComprehensibilityExact) / 2;
                var newTotalPointsRounded =  Math.round(newTotalPointsExact);

                data = {
                    $set: {
                        rating: {
                            totalUsers: newTotalUsers,
                            totalPoints: {
                                exact: newTotalPointsExact,
                                rounded: newTotalPointsRounded
                            },
                            quality: {
                                exact: newQualityExact,
                                rounded: newQualityRounded,
                            },
                            comprehensibility: {
                                exact: newComprehensibilityExact,
                                rounded: newComprehensibilityRounded,
                            }
                        }
                    }
                };

                // update post
                collectionPosts.update({'_id': oId }, data, function(){
                    var userId = req.user._id;
                    collectionUser.findAndModify({'_id': userId}, [['_id','asc']], { $push: { ratedPosts: postId }}, {}, function() {
                        res.json('ok');
                    });
                });

            });
        },

        addRatingStructure: function(oId){
            var data = {
                $set: {
                    rating: {
                        totalUsers: 0,
                        totalPoints: {
                            exact: 0,
                            rounded: 0
                        },
                        quality: {
                            exact: 0,
                            rounded: 0,
                        },
                        comprehensibility: {
                            exact: 0,
                            rounded: 0,
                        }
                    }
                }
            };
            collectionPosts.update({'_id': oId }, data );
        },

        comparePostsTags: function(newTags, oldTags){
            var addedTags = [];
            var removedTags = [];
            var isInArray = '';
            for(var i = 0; i < newTags.length; i++){
                isInArray = oldTags.indexOf(newTags[i]);
                if(isInArray === -1){
                    addedTags.push(newTags[i]);
                }
                if(i === newTags.length - 1){
                    helpers.checkTags.init(addedTags, true);
                }
            }
            for(var j = 0; j < oldTags.length; j++){
                isInArray = newTags.indexOf(oldTags[j]);
                if(isInArray === -1){
                    removedTags.push(oldTags[j]);
                }
                if(j === oldTags.length - 1){
                    helpers.checkTags.init(removedTags, false);
                }
            }
        }
    };
};