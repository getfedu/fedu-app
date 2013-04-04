define([
    'jquery', 'underscore', 'backbone', 'backbonePaginator', '../models/posts', '../vendor/fedu/config'
], function($, _, Backbone, Paginator, TheModel, TheConfig) {
    'use strict';

    var paginatedCollection = Backbone.Paginator.requestPager.extend({
        model: TheModel,

        paginator_core: {
            // the type of reply
            dataType: 'json',

            url: function() {
                return  TheConfig.nodeUrl + '/post';
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
            //'filter': '',

            // number of items to return per request/page
            'top': function() { return this.perPage; },

            // how many results the request should skip ahead to
            // customize as needed. For the Netflix API, skipping ahead based on
            // page * number of results per page was necessary.
            'skip': function() { return this.currentPage * this.perPage; },
        },

        parse: function(response){
            return response;
        }
    });

    return paginatedCollection;
});