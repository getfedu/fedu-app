define([
    'jquery', 'underscore', 'backbone', '../models/video'
], function($, _, Backbone, TheModel) {
    'use strict';

    var collection = Backbone.Collection.extend({
        model: TheModel,
        url: function() {
            return 'http://localhost:3100/get-videos';
        },

        parse: function(response){ // manipulate response data

            return response;

        },

        fetchData: function(view){
            var that = this;
            this.fetch({
                success: function(collection) {
                    console.log('success - data of %s is fetched', collection);
                    view.renderVideos();
                },
                error: function(){
                    console.log('error - no data was fetched');
                }
            });
        },

    });

    return collection;
});