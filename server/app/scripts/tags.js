// CRUD - Backend Tags
///////////////////////////////////////////////////////////

'use strict';
var mongodb = require('mongodb');

module.exports = function(app, collectionTags){
    // Create Tags and save into db
    app.post('/tag', function(req, res) {
        collectionTags.insert(req.body, function() {
            res.json('ok');
        });
    });

    // Read Tags from db
    app.get('/tag', function(req, res) {
        collectionTags.find().sort({ counter: -1}).toArray(function(err, results){
            res.json(results);
        });
    });

    app.put('/tag/:id', function(req, res) {
        var BSON = mongodb.BSONPure;
        var oId = new BSON.ObjectID(req.params.id);
        delete req.body._id;
        collectionTags.update({'_id': oId }, req.body, function(){
            res.json('ok');
        });
    });

    app.get('/popular-tags', function(req, res) {
        collectionTags.find().sort({ counter: -1}).limit(5).toArray(function(err, results){
            res.json(results);
        });
    });

    app.get('/surprise-tags', function(req, res) {
        collectionTags.find().sort({ counter: -1}).limit(10).toArray(function(err, results){
            res.json(results);
        });
    });
};