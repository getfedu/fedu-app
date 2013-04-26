// Authentication
///////////////////////////////////////////////////////////

'use strict';
var localStrategy = require('passport-local').Strategy;
var mongodb = require('mongodb');
var passport = require('passport');
var crypto = require('crypto');

module.exports = function(saltKey, collectionUser){
    var auth = {
        init: function(){
            passport.use(new localStrategy(
                function(username, password, done) {
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

            passport.serializeUser(function(user, done) {
                var userId = user._id;
                done(null, userId.toHexString());
            });

            passport.deserializeUser(function(id, done) {
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