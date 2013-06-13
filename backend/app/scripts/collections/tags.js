define([
    'jquery',
    'underscore',
    'backbone',
    '../models/tags',
    'json!../../settings.json'
], function($, _, Backbone, TheModel, TheConfig) {
    'use strict';

    var collection = Backbone.Collection.extend({
        model: TheModel,
        url: function() {
            return  TheConfig.nodeUrl + '/tag';
        },

        parse: function(response){ // manipulate response data
            return response;
        },

        fetchData: function(){
            var that = this;
            this.fetch({
                success: function(collection) {
                    that.collection = collection;
                    that.trigger('tagsFetched');
                },
                error: function(){
                    console.log('error - no data was fetched');
                }
            });
        }

    });

    return collection;
});