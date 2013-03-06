define([
	'underscore',
	'backbone'
], function( _, Backbone) {
	'use strict';

	var theModel = Backbone.Model.extend({
		url: 'http://localhost:3100/add-post',
		// Default key/values
		defaults: {
			title: '',
			videoUrl: '',
			description: ''
		}
	});

	return theModel;
});
