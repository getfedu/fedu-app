define([
    'jquery', 'underscore', 'backbone', '../models/model'
], function($, _, Backbone, TheModel) {
    'use strict';

    var collection = Backbone.Collection.extend({
        model: TheModel,
        url: function() {
            return 'url';
        },

        parse: function(response){ // manipulate response data

            return response;

        },

        fetchData: function(){
            var that = this;
            this.fetch({
                success: function(collection) {
                    console.log('success - data of %s is fetched', collection);
                    console.log(that);
                },
                error: function(){
                    console.log('error - no data was fetched');
                }
            });
        },

        saveData: function(){
            if(!_.isEmpty(this.models)) {
                _.each(this.models, function(value){
                    value.save();
                });
            }
        }

    });

    return collection;
});