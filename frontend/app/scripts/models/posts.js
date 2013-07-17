define([
	'underscore',
	'backbone',
	'json!../../settings.json'
], function( _, Backbone, TheConfig) {
	'use strict';

	var theModel = Backbone.Model.extend({
		urlRoot: TheConfig.nodeUrl + '/post',
		idAttribute: '_id',

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
