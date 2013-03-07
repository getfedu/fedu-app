define([
    'jquery', 'underscore', 'backbone', '../models/posts'
], function($, _, Backbone, TheModel) {
    'use strict';

    var collection = Backbone.Collection.extend({
        model: TheModel,
        url: function() {
            return  'http://localhost:3100/get/posts';
        },

        parse: function(response){ // manipulate response data

            return response;

        },

        fetchData: function(){
            var that = this;
            this.fetch({
                success: function(collection) {
                    that.collection = collection;
                    that.trigger('postsFetched');
                },
                error: function(){
                    console.log('error - no data was fetched');
                }
            });
        }
    });

    return collection;
});