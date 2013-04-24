// Login
///////////////////////////////////////////////////////////

'use strict';
var passport = require('passport');
var crypto = require('crypto');

module.exports = function(app, saltKey, collectionUser){
    var auth = require('./auth.js')(saltKey, collectionUser);

    app.post('/login', function(req, res, next) {
        passport.authenticate('local', function(err, user) {
            if (err) {
                return next(err);
            }
            if (!user) {
                res.status(401);
                res.send('Password or Username is wrong.');
                return;
            }
            if(user.activated){
                res.status(401);
                res.send('Account is not activated!');
                return;
            }
            req.logIn(user, function(err) {
                if (err) {
                    return next(err);
                }
                res.send('Authorization succeeded!');
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

        var userObj = {
            username: username,
            password: saltedPassword,
            activated: false
        };

        collectionUser.findOne({ username: username }, function(err, user) {
            if(user){
                res.status(406);
                res.send('Username already in use');
            } else {
                collectionUser.insert(userObj, function() {
                    res.send(JSON.stringify('Registred'));
                });
            }
        });
    });
};