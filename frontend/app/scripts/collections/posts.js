define([
    'jquery', 'underscore', 'backbone', '../models/posts'
], function($, _, Backbone, TheModel) {
    'use strict';

    var collection = Backbone.Collection.extend({
        model: TheModel,
        url: function() {
            return  window.feduConfig.nodeUrl + '/get-videos';
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