define([
    'jquery', 'underscore', 'backbone', '../models/tags', '../vendor/fedu/config'
], function($, _, Backbone, TheModel, TheConfig) {
    'use strict';

    var collection = Backbone.Collection.extend({
        model: TheModel,
        url: function() {
            return  TheConfig.nodeUrl + '/tag';
        },

        parse: function(response){ // manipulate response data
            return response;
        }

    });

    return collection;
});