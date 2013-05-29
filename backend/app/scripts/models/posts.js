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
			videoId: '',
			videoType: '',
			title: '',
			description: '',
			userName: '',
			category: '',
			tags: '',
			publishDate: '',
			updateDate: '',
			additionalInfo: [],
			foreign: {
				embedUrl: '',
				uploadDate: '',
				duration: '',
				thumbnail: {
					small: '',
					medium: '',
					large: ''
				},
				channelId: '',
				channelName: '',
				likeCount: '',
				playCount: '',
				commentCount: '',
				caption: ''
			}
		}
	});

	return theModel;
});
