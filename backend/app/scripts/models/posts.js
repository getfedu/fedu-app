define([
	'underscore',
	'backbone',
	'../vendor/fedu/config'
], function( _, Backbone, TheConfig) {
	'use strict';

	var theModel = Backbone.Model.extend({
		idAttribute: '_id',
		urlRoot: function() {
            return TheConfig.nodeUrl + '/post';
        },
		// Default key/values
		defaults: {
			title: '',
			videoId: '',
			videoType: '',
			description: ''
		}
	});

	return theModel;
});
