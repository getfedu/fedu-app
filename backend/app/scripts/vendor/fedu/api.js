define([
    'jquery',
    'underscore',
    'backbone',
    './config'
], function( $, _, Backbone, TheConfig) {
    'use strict';

    var api = {
        theData: {},
        getData: function(id, type){
            var that = this;
            $.ajax({
                type: 'POST',
                url: TheConfig.nodeUrl + '/api-call',
                data: { key: TheConfig.youtubeApiKey, id: id, type: type }
            }).done(function(result){
                that.parseData(result);
            });
        },

        parseData: function(data){

            console.log(data);

            var title = data.videoData.items[0].snippet.title;
            var description = data.videoData.items[0].snippet.description;
            var thumbnail = data.videoData.items[0].snippet.thumbnails.high.url;

            this.theData = { title: title, description: description, thumbnail: thumbnail };
            this.trigger('apiDataFetched');
        }
    };
    _.extend(api, Backbone.Events); //add Backbone Events to "talk" to other "classes"
    return api;
});