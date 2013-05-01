// Authentication
///////////////////////////////////////////////////////////

'use strict';
var localStrategy = require('passport-local').Strategy;
var twitterStrategy = require('passport-twitter').Strategy;
var mongodb = require('mongodb');
var passport = require('passport');
var crypto = require('crypto');
var moment = require('moment');

module.exports = function(saltKey, collectionUser){
    var auth = {
        init: function(){
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

            // twitter
            passport.use(new twitterStrategy({
                consumerKey: 'QW04KQwoiD574WC9DeCoDg',
                consumerSecret: 'QQuC3XBb9ptUuiAGStVwi4spumTPLtJKPPifLIyuOM',
                callbackURL: '/auth/twitter/callback'
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