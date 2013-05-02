// notification
///////////////////////////////////////////////////////////
'use strict';
var mongodb = require('mongodb');
var moment = require('moment');

module.exports = function(app, collectionNotifications, socketIo, saltKey, collectionUser){
    var auth = require('./auth.js')(saltKey, collectionUser);

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

    app.get('/pull-request', auth.isAuth, function(req, res) {

        var data = {
            id: req.query.id,
            type: req.query.type,
            title: req.query.title,
            description: req.query.description,
            pullRequestTitle: req.query.pullRequestTitle,
            pullRequestUrl: req.query.pullRequestUrl,
            submitter: req.user.username,
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
            collectionNotifications.find({checked: false}).limit(3).sort({_id: -1}).toArray(function(err, results){
                res.setHeader('Content-Type', 'application/json');
                res.send(results);
            });

        } else if(req.query.filter === 'countUnchecked'){
            collectionNotifications.find({checked: false}).count(function(e, count){
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
};