define([
    'jquery',
    'underscore',
    'backbone',
    'json!../../settings.json'
], function( $, _, Backbone, TheConfig) {
    'use strict';

    var api = {
        theData: {},
        getData: function(id, type){
            var that = this;
            $.ajax({
                type: 'POST',
                url: TheConfig.nodeUrl + '/api-call',
                data: { id: id, type: type }
            }).done(function(result, textStatus, jqXHR){
                if(jqXHR.status === 204){
                    console.log('Für diese ID haben wir kein Video gefunden...');
                } else {
                    that.parseData(result);
                }
            });
        },

        parseData: function(data){
            this.theData = data;
            this.trigger('apiDataFetched');
        }
    };
    _.extend(api, Backbone.Events); //add Backbone Events to "talk" to other "classes"
    return api;
});