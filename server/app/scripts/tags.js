// CRUD - Backend Tags
///////////////////////////////////////////////////////////

'use strict';
var mongodb = require('mongodb');

module.exports = function(app, collectionTags){
    // Create Tags and save into db
    app.post('/tag', function(req, res) {
        collectionTags.insert(req.body, function() {
            res.send(JSON.stringify('OK'));
        });
    });

    // Read Tags from db
    app.get('/tag', function(req, res) {

        collectionTags.find().sort({ counter: -1}).toArray(function(err, results){
            res.setHeader('Content-Type', 'application/json');
            res.send(results);
        });

    });

    app.put('/tag/:id', function(req, res) {
        var BSON = mongodb.BSONPure;
        var oId = new BSON.ObjectID(req.params.id);
        delete req.body._id;
        collectionTags.update({'_id': oId }, req.body, function(){
            res.send(JSON.stringify('OK'));
        });
    });
};