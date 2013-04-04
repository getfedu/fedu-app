define([
    'jquery', 
    'underscore', 
    'backbone', 
    '../models/notifications', 
    '../vendor/fedu/config'
], function($, _, Backbone, TheModel, TheConfig) {
    'use strict';

    var collection = Backbone.Collection.extend({
        model: TheModel,
        url: function() {
            return  TheConfig.nodeUrl + '/notification';
        },

        parse: function(response){ // manipulate response data
            return response;
        },

        fetchData: function(){
            var that = this;
            this.fetch({
                success: function(collection) {
                    that.collection = collection;
                    that.trigger('notificationsFetched');
                },
                error: function(){
                    console.log('error - no data was fetched');
                }
            });
        }

    });

    return collection;
});