'use strict';
var express = require('express');
var mongodb = require('mongodb');
var passport = require('passport');
var auth = null;
var tags = null;
var posts = null;
var login = null;
var search = null;
var api = null;
var notifications = null;
require('socket.io');

var app = null;
var appSocketIo = null;
var socketIo = null;
var saltKey = 'aGvcVZtRMjdddFxtjyur5vwpNIKp2i';
var collectionPosts = {};
var collectionTags = {};
var collectionNotifications = {};
var collectionUser = {};


// init
///////////////////////////////////////////////////////////
var init = {

    db: function(){
        var that = this;
        mongodb.connect('mongodb://localhost', function(err, db) {
            if(err){
                throw err;
            }
            console.log('connected');
            var theDb = db.db('admin');
            collectionPosts = theDb.collection('posts');
            collectionTags = theDb.collection('tags');
            collectionNotifications = theDb.collection('notifications');
            collectionUser = theDb.collection('user');

            that.serverIsReady();
        });
    },

    allowedOrigin: function(url){
        var array = ['http://localhost:9100', 'http://localhost:9000', 'http://localhost:10088', 'http://localhost'];
        if(array.indexOf(url) !== -1){
            return url;
        } else {
            return '';
        }
    },

    express: function(){
        app = express();
        app.use(require('express-chrome-logger'));
        app.configure(function() {
            app.use(express.static('public'));
            app.use(express.cookieParser());
            app.use(express.session({ secret: '8MJBCAiDtrQIIiJnoFEfhXMUUjqD5A', cookie: { secure: false, httpOnly: false }}));
            app.use(express.bodyParser());
            app.use(passport.initialize());
            app.use(passport.session());
            app.use(app.router);
        });

        var that = this;
        app.all('*', function(req, res, next) {
            res.header('Access-Control-Allow-Origin', that.allowedOrigin(req.headers.origin));
            res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE, PUT');
            res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
            res.header('Access-Control-Allow-Credentials', 'true');
            next();
        });

        // server listen on port X
        app.listen(3100);

    },

    socketIo: function(){
        appSocketIo = express();
        var serverSocketIo = require('http').createServer(appSocketIo);
        socketIo = require('socket.io').listen(serverSocketIo);
        socketIo.set('log level', 1);
        serverSocketIo.listen(4321);
    },

    serverIsReady: function(){
        auth = require('./auth.js')(saltKey, collectionUser);
        posts = require('./posts.js')(app, collectionPosts, collectionTags, collectionNotifications, collectionUser, saltKey);
        tags = require('./tags.js')(app, collectionTags, saltKey, collectionUser);
        login = require('./login.js')(app, saltKey, collectionUser);
        search = require('./search.js')(app, collectionPosts);
        api = require('./api.js')(app, saltKey, collectionUser);
        notifications = require('./notifications.js')(app, collectionNotifications, socketIo, saltKey, collectionUser);
        auth.init();
    }
};

init.db();
init.express();
init.socketIo();

//General Options-Handler (no use atm)
app.options('/*', function(req, res) {
    res.send(JSON.stringify(res.headers));
});