define([
	'underscore',
	'backbone'
], function( _, Backbone) {
	'use strict';

	var theModel = Backbone.Model.extend({
		// url: 'http://localhost:3100/add-video',
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
