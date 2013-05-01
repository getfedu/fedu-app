define([
	'underscore',
	'backbone',
	'../vendor/fedu/options'
], function( _, Backbone, TheOption) {
	'use strict';

	var theModel = Backbone.Model.extend({
		urlRoot: TheOption.nodeUrl + '/post',
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
