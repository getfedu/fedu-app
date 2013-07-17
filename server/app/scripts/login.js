// Login
///////////////////////////////////////////////////////////

'use strict';
var passport = require('passport');
var crypto = require('crypto');
var moment = require('moment');
var nodemailer = require('nodemailer');

var settings = require('../settings.json');
var backendHost = settings.backendHost;
var frontendHost = settings.frontendHost;

module.exports = function(app, saltKey, collectionUser){
    var auth = require('./auth.js')(saltKey, collectionUser);

    app.post('/login', auth.isNotAuth, function(req, res, next) {
        passport.authenticate('local', function(err, user) {
            if (err) {
                return next(err);
            }
            if (!user) {
                res.status(401);
                res.json({ key: 'wrongInput', message: 'Sorry... Your login failed, password or username are wrong, please check it and try again.'});
                return;
            }
            if(user.activated !== 'activated'){
                res.status(401);
                res.json({ key: 'notActivated', message: 'Sorry... But your Account is not activated click the link in the Email we have sent you. <a href="' + backendHost + '#activate/' + user.activated +'?force=true">resend</a>'});
                return;
            }
            req.logIn(user, function(err) {
                if (err) {
                    return next(err);
                }
                var userId = user._id;
                res.cookie('user_b', new Buffer(userId.toHexString()).toString('base64'));
                res.cookie('user_f', new Buffer(userId.toHexString()).toString('base64'));
                res.json('Ok');
                return;
            });
        })(req, res, next);
    });

    app.get('/logout', auth.isAuth, function(req, res){
        req.logout();
        res.cookie('user_b', '');
        res.cookie('user_f', '');
        res.cookie('connect.sid', '');
        res.json({key:'logged_out', message: 'You are successfully logged out!' });
    });

    // app.get('/account', auth.isAuth, function(req, res){
    //     res.send('ok');
    // });

    app.get('/user', auth.isAuth, function(req, res){
        res.json({'username': req.user.username, 'favoritePosts': req.user.favoritePosts, 'ratedPosts': req.user.ratedPosts});
    });

    app.post('/register', function(req, res){

        res.status(409);
        res.json({key:'noRegistration', message: 'Sorry... You cannot register for fedu now!'});

        // var username = req.body.username;
        // var saltedPassword = helpers.generateSaltedPassword(username, req.body.password);
        // var activationHash = helpers.generateHash(username);

        // var userObj = {
        //     username: username,
        //     password: saltedPassword,
        //     activated: activationHash,
        //     registrationDate: moment().format()
        // };

        // collectionUser.findOne({ username: username }, function(err, user) {
        //     if(user){
        //         res.status(409);
        //         res.json({key:'usernameTaken', message: 'Sorry... This username is already taken by another person...'});
        //     } else {
        //         collectionUser.insert(userObj);
        //         helpers.registrationEmail(activationHash, username, res);
        //     }
        // });
    });

    app.get('/activate/:code', auth.isNotAuth, function(req, res){
        var code = req.params.code;
        var force = '';
        if(!req.query.force){
            force = false;
        } else {
            force = req.query.force;
        }

        collectionUser.findOne({ activated: code }, function(err, user) {
            if(user){
                var registrationDateUnix = moment(user.registrationDate).unix();
                var todayUnix = moment(moment().add('days', -2)).unix();
                if(todayUnix <= registrationDateUnix && !force){
                    collectionUser.update({ activated: code }, {$set: { activated: 'activated' }}, function(){
                        res.json({ key: 'ok', message: 'Your Account was successfully activated!'});
                    });
                } else {
                    var activationHash = helpers.generateHash(user.username);

                    collectionUser.update({ activated: code }, {$set: { activated: activationHash, registrationDate: moment().format() }}, function(){
                        helpers.sendRegistrationMailAgain(activationHash, user.username);
                        res.status(401);
                        if(force){
                            res.json({key: 'resend', message: 'We sent you a new Activation-Code by Email.'});
                        } else {
                            res.json({key: 'timeExceeded', message: 'Sorry, but the time limit of your Activation-Code is exceeded. We sent you a new one by Email.'});
                        }
                    });
                }
            } else {
                res.status(401);
                res.json({ key: 'invalidCode', message: 'Sorry, but your Activation-Code is invalid.'});
            }
        });
    });

    app.post('/recover-password', auth.isNotAuth, function(req, res) {
        var username = req.body.username;
        collectionUser.findOne({ username: username }, function(err, user) {
            if(user){
                var recoveryHash = helpers.generateHash(user.username);
                collectionUser.update({ username: username }, {$set: { recoverPasswordHash: recoveryHash, recoverPasswordDate: moment().format() }}, function(){
                    helpers.passwordRecoveryEmail(recoveryHash, user.username);
                    res.json({key:'passwordRecoveryActivated', message: 'We just sent you an email with a link to create a new password!'});
                });
            } else {
                res.status(409);
                res.json({key:'usernameNotFound', message: 'Sorry... This Username is not in our Database..'});
            }
        });
    });

    app.post('/recover-password/:code', auth.isNotAuth, function(req, res) {
        var code = req.params.code;
        collectionUser.findOne({ recoverPasswordHash: code }, function(err, user) {
            if(user){
                var newPassword = helpers.generateSaltedPassword(user.username, req.body.password);
                var recoverPasswordDateUnix = moment(user.recoverPasswordDate).unix();
                var todayUnix = moment(moment().add('minutes', -30)).unix();
                if(todayUnix <= recoverPasswordDateUnix){
                    collectionUser.update({ recoverPasswordHash: code }, {$unset: { recoverPasswordHash: 1, recoverPasswordDate: 1 }, $set: { password: newPassword }}, function(){
                        res.json({key:'newPasswordSet', message: 'Ok'});
                    });
                } else {
                    res.status(409);
                    res.json({key:'usernameNotFound', message: 'Sorry... The time limit for the Password recovery is already exceeded. <a href="' + backendHost + '#recover-password">Try Recover again.</a>'});
                }
            } else {
                res.status(409);
                res.json({key:'usernameNotFound', message: 'Sorry... This is an invalid Recovery-Code.'});
            }
        });
    });

    // Twitter
    app.get('/auth/twitter', auth.isNotAuth, passport.authenticate('twitter'));

    app.get('/auth/twitter/callback', auth.isNotAuth, function(req, res, next) {
        passport.authenticate('twitter', function(err, user) {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.redirect( frontendHost + '#login-error');
            }
            req.logIn(user, function(err) {
                if (err) {
                    return next(err);
                }
                var userId = user._id;
                userId = new Buffer(userId.toHexString()).toString('base64');
                res.cookie('user_f', userId);
                return res.redirect( frontendHost + '#login-success');
            });
        })(req, res, next);
    });


    // Twitter
    app.get('/auth/facebook', auth.isNotAuth, passport.authenticate('facebook'));

    app.get('/auth/facebook/callback', auth.isNotAuth, function(req, res, next) {
        passport.authenticate('facebook', function(err, user) {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.redirect( frontendHost + '#login-error');
            }
            req.logIn(user, function(err) {
                if (err) {
                    return next(err);
                }
                var userId = user._id;
                userId = new Buffer(userId.toHexString()).toString('base64');
                res.cookie('user_f', userId);
                return res.redirect( frontendHost + '#login-success');
            });
        })(req, res, next);
    });

    //Google
    app.get('/auth/google', auth.isNotAuth, passport.authenticate('google'));

    app.get('/auth/google/callback', auth.isNotAuth, function(req, res, next) {
        passport.authenticate('google', function(err, user) {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.redirect( frontendHost + '#login-error');
            }
            req.logIn(user, function(err) {
                if (err) {
                    return next(err);
                }
                var userId = user._id;
                userId = new Buffer(userId.toHexString()).toString('base64');
                res.cookie('user_f', userId);
                return res.redirect( frontendHost + '#login-success');
            });
        })(req, res, next);
    });


    var helpers = {
        registrationEmail: function(activationHash, username, res){
            var transport = nodemailer.createTransport('sendmail');

            var mailOptions = {
                from: 'getfedu <mail@getfedu.com>',
                to: username,
                subject: 'Your registration at getfedu.com',
                text: 'You registred an Account on getfedu.com with this Emailadress: ' + username + ' To verify your Account please click this link:'  + backendHost + '#activate/' + activationHash,
                html: 'You registred an Account on getfedu.com with this Emailadress: ' + username + '<br/><br/> To verify your Account please click this link: <b>' + backendHost + '#activate/' + activationHash + '</b>'
            };

            transport.sendMail(mailOptions, function(error, response){
                if(error){
                    console.log(error, response);
                } else {
                    res.json({ key: 'regSucceeded', message: 'Nice one, you successfully registred your Account. Please click the link in the Email we have sent yout to verfify your Account.'});
                }
            });
        },

        sendRegistrationMailAgain: function(activationHash, username) {
            var transport = nodemailer.createTransport('sendmail');

            var mailOptions = {
                from: 'getfedu <mail@getfedu.com>',
                to: username,
                subject: 'Your new Registration-Code for getfedu.com',
                text: 'You just requested a new Regisration-Code for your Account on getfedu.com with this Emailadress: ' + username + 'Here it is :) To verify your Account please click this link: ' + backendHost + '#activate/' + activationHash,
                html: 'You just requested a new Regisration-Code for your Account on getfedu.com with this Emailadress: ' + username + '<br/><br/> Here it is :) To verify your Account please click this link: <b>' + backendHost + '#activate/' + activationHash + '</b>'
            };

            transport.sendMail(mailOptions, function(error, response){
                if(error){
                    console.err(error, response);
                }
            });
        },

        passwordRecoveryEmail: function(recoveryHash, username){
            var transport = nodemailer.createTransport('sendmail');

            var mailOptions = {
                from: 'getfedu <mail@getfedu.com>',
                to: username,
                subject: 'Password recover from getfedu.com',
                text: 'You just ordered to reset your Password. To set a new Password please click this link: ' + backendHost + '#recover-password/' + recoveryHash,
                html: 'You just ordered to reset your Password.</br></br> To set a new Password please click this link: ' + backendHost + '#recover-password/' + recoveryHash,
            };

            transport.sendMail(mailOptions, function(error, response){
                if(error){
                    console.log(error, response);
                }
            });
        },

        generateHash: function(username){
            var hash = crypto.createHash('sha1');
            hash.update(moment().format());
            hash.update(username);
            hash = hash.digest('hex');

            return hash;
        },

        generateSaltedPassword: function(username, password){
            var saltedPassword = crypto.createHmac('sha256', saltKey + username);
            saltedPassword.update(password);
            saltedPassword = saltedPassword.digest('hex');

            return saltedPassword;
        }
    };
};