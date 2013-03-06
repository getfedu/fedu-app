define([
    'jquery', 'underscore', 'backbone', '../models/posts'
], function($, _, Backbone, TheModel) {
    'use strict';

    var collection = Backbone.Collection.extend({
        model: TheModel,
        url: function() {
            return  window.feduConfig.nodeUrl + '/get/posts';
        },

        parse: function(response){ // manipulate response data

            return response;

        }
    });

    return collection;
});