// Login
///////////////////////////////////////////////////////////

'use strict';
var passport = require('passport');
var crypto = require('crypto');
var moment = require('moment');
var nodemailer = require('nodemailer');

module.exports = function(app, saltKey, collectionUser){
    var auth = require('./auth.js')(saltKey, collectionUser);

    app.post('/login', function(req, res, next) {
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
                res.json({ key: 'notActivated', message: 'Sorry... But your Account is not activated click the link in the Email we have sent you. <a href="http://localhost:9100/#activate/' + user.activated +'?force=true">resend</a>'});
                return;
            }
            req.logIn(user, function(err) {
                if (err) {
                    return next(err);
                }
                res.json('Ok');
                return;
            });
        })(req, res, next);
    });

    app.get('/logout', auth.isAuth, function(req, res){
        req.logout();
        res.cookie('connect.sid', '');
        res.send('logged out');
    });

    app.get('/account', auth.isAuth, function(req, res){
        res.send('ok');
    });

    app.post('/register', function(req, res){

        var username = req.body.username;
        var saltedPassword = crypto.createHmac('sha256', saltKey + username);
        saltedPassword.update(req.body.password);
        saltedPassword = saltedPassword.digest('hex');

        var activationHash = helpers.generateActivationHash(username);

        var userObj = {
            username: username,
            password: saltedPassword,
            activated: activationHash,
            registrationDate: moment().format()
        };

        collectionUser.findOne({ username: username }, function(err, user) {
            if(user){
                res.status(409);
                res.json({key:'usernameTaken', message: 'Sorry... This username is already taken by another person...'});
            } else {
                collectionUser.insert(userObj);
                helpers.registrationEmail(activationHash, username, res);
            }
        });
    });

    app.get('/activate/:code', function(req, res){
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
                    var activationHash = helpers.generateActivationHash(user.username);

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

    var helpers = {
        registrationEmail: function(activationHash, username, res){
            var transport = nodemailer.createTransport('sendmail');

            var mailOptions = {
                from: 'getfedu <mail@getfedu.com>',
                to: username,
                subject: 'Your registration at getfedu.com',
                text: 'You registred an Account on getfedu.com with this Emailadress: ' + username + ' To verify your Account please click this link: http://localhost:9100/#activate/' + activationHash,
                html: 'You registred an Account on getfedu.com with this Emailadress: ' + username + '<br/><br/> To verify your Account please click this link: <b>http://localhost:9100/#activate/' + activationHash + '</b>'
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
                text: 'You just requested a new Regisration-Code for your Account on getfedu.com with this Emailadress: ' + username + 'Here it is :) To verify your Account please click this link: http://localhost:9100/#activate/' + activationHash,
                html: 'You just requested a new Regisration-Code for your Account on getfedu.com with this Emailadress: ' + username + '<br/><br/> Here it is :) To verify your Account please click this link: <b>http://localhost:9100/#activate/' + activationHash + '</b>'
            };

            transport.sendMail(mailOptions, function(error, response){
                if(error){
                    console.err(error, response);
                }
            });
        },

        generateActivationHash: function(username){
            var activationHash = crypto.createHash('sha1');
            activationHash.update(moment().format());
            activationHash.update(username);
            activationHash = activationHash.digest('hex');

            return activationHash;
        }
    };
};