define([
    'jquery',
    'underscore',
    'backbone',
    'backbonePaginator',
    '../models/notifications',
    '../vendor/fedu/config'
], function($, _, Backbone, Paginator, TheModel, TheConfig) {
    'use strict';

    var paginatedCollection = Backbone.Paginator.requestPager.extend({
        model: TheModel,

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
        },

        paginator_core: {
            // the type of reply
            dataType: 'json',

            url: function() {
                return  TheConfig.nodeUrl + '/notification';
            }
        },

        paginator_ui: {
            // the lowest page index your API allows to be accessed
            firstPage: 0,

            // which page should the paginator start from
            // (also, the actual page the paginator is on)
            currentPage: 0,

            // how many items per page should be shown
            perPage: 3

        },

        server_api: {
            // the query field in the request
            filter: 'all',
        },

        parse: function(response){
            return response;
        }
    });

    return paginatedCollection;
});