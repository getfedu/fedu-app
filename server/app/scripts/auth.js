// Authentication
///////////////////////////////////////////////////////////

'use strict';
var localStrategy = require('passport-local').Strategy;
var twitterStrategy = require('passport-twitter').Strategy;
var facebookStrategy = require('passport-facebook').Strategy;
var googleStrategy = require('passport-google').Strategy;
var mongodb = require('mongodb');
var passport = require('passport');
var crypto = require('crypto');
var moment = require('moment');
var settings = require('../settings.json');
var nodeUrl = settings.nodeUrl;

module.exports = function(saltKey, collectionUser){
    var auth = {
        init: function(){

            // Local
            passport.use(new localStrategy(
                function(username, password, done){
                    var saltedPassword = crypto.createHmac('sha256', saltKey + username);
                    saltedPassword.update(password);
                    saltedPassword = saltedPassword.digest('hex');
                    collectionUser.findOne({ username: username }, function(err, user) {
                        if(err){
                            return done(err);
                        }
                        if(!user){
                            return done(null, false, { message: 'Incorrect username.' });
                        }
                        if(user.password !== saltedPassword){
                            return done(null, false, { message: 'Incorrect password.' });
                        }
                        return done(null, user);
                    });
                }
            ));

            // twitter
            passport.use(new twitterStrategy({
                consumerKey: settings.twitterConsumerKey,
                consumerSecret: settings.twitterConsumerSecret,
                callbackURL: nodeUrl + '/auth/twitter/callback'
            },
            function(token, tokenSecret, profile, done) {
                collectionUser.findOne({'socialId.twitter': profile.id}, function(err, user) {
                    if(user) {
                        done(null, user);
                    } else {
                        var body = {
                            username: profile.username,
                            userImage: profile.photos[0].value,
                            registrationDate: moment().format(),
                            socialId: {
                                twitter: profile.id
                            },
                            activated: 'activated'
                        };

                        collectionUser.insert(body, function(err, user) {
                            done(null, user[0]);
                        });

                    }
                });
            }));

            // facebook
            passport.use(new facebookStrategy({
                clientID: settings.facebookClientId,
                clientSecret: settings.facebookClientSecret,
                callbackURL: nodeUrl + '/auth/facebook/callback'
            },
            function(accessToken, refreshToken, profile, done) {
                collectionUser.findOne({'socialId.facebook': profile.id}, function(err, user) {
                    if(user) {
                        done(null, user);
                    } else {
                        var body = {
                            username: profile.username,
                            registrationDate: moment().format(),
                            socialId: {
                                facebook: profile.id
                            },
                            activated: 'activated'
                        };

                        collectionUser.insert(body, function(err, user) {
                            done(null, user[0]);
                        });

                    }
                });
            }));

            // google
            passport.use(new googleStrategy({
                    returnURL: nodeUrl + '/auth/google/callback',
                    realm: nodeUrl
                },
                function(identifier, profile, done) {
                    collectionUser.findOne({'socialId.google': identifier}, function(err, user) {
                        if(user) {
                            done(null, user);
                        } else {
                            var body = {
                                username: profile.displayName,
                                registrationDate: moment().format(),
                                socialId: {
                                    google: identifier
                                },
                                activated: 'activated'
                            };

                            collectionUser.insert(body, function(err, user) {
                                done(null, user[0]);
                            });

                        }
                    });
                }
            ));

            passport.serializeUser(function(user, done){
                var userId = user._id;
                userId = userId.toHexString();
                done(null, userId);
            });

            passport.deserializeUser(function(id, done){
                var BSON = mongodb.BSONPure;
                var userId = new BSON.ObjectID(id);
                collectionUser.findOne({'_id': userId}, function(err, user) {
                    done(err, user);
                });
            });


        },

        isAuth: function(req, res, next){
            if (req.isAuthenticated()){
                return next();
            }
            res.status(401);
            res.send('Unauthroized!');
        },

        isNotAuth: function(req, res, next){
            if (!req.isAuthenticated()){
                return next();
            }
            res.status(409);
            res.json({ key: 'alreadyAuth', message: 'Your are logged in. For this function, please log out'});
        }
    };
    return auth;
};