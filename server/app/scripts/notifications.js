// notification
///////////////////////////////////////////////////////////
'use strict';
var mongodb = require('mongodb');
var moment = require('moment');

module.exports = function(app, collectionNotifications, socketIo, saltKey, collectionUser){
    var auth = require('./auth.js')(saltKey, collectionUser);

    app.post('/flag-post', function(req, res) {
        var data = {
            id: req.body.id,
            type: req.body.type,
            title: req.body.title,
            description: req.body.description,
            checked: false,
            publishDate: moment().format(),
            updateDate: moment().format(),
        };
        collectionNotifications.insert(data, function(err, result) {
            data.pullRequestId = result[0]._id;
            socketIo.sockets.emit ('notify-post', data); // websocket
            res.json('ok');
        });
    });

    app.post('/pull-request', auth.isAuth, function(req, res) {
        var data = {
            id: req.body.id,
            type: req.body.type,
            title: req.body.title,
            description: req.body.description,
            pullRequestTitle: req.body.pullRequestTitle,
            pullRequestUrl: req.body.pullRequestUrl,
            submitter: req.user.username,
            checked: false,
            publishDate: moment().format(),
            updateDate: moment().format()
        };
        collectionNotifications.insert(data, function(err, result) {
            data.pullRequestId = result[0]._id;
            socketIo.sockets.emit('notify-post', data); // websocket
            res.json('ok');
        });
    });

    app.get('/notification', function(req, res) {
        if(req.query.filter === 'all'){
            collectionNotifications.find().sort({'_id': -1}).toArray(function(err, results){
                res.json(results);
            });
        } else if(req.query.filter === 'partial'){
            collectionNotifications.find({checked: false}).limit(3).sort({_id: -1}).toArray(function(err, results){
                res.json(results);
            });
        } else if(req.query.filter === 'countUnchecked'){
            collectionNotifications.find({checked: false}).count(function(e, count){
                var object = {uncheckedNotifications: count};
                res.json(object);
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
            res.json(results);
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
            res.json('ok');
        });
    });
};