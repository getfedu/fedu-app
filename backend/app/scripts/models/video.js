define([
	'underscore',
	'backbone'
], function( _, Backbone) {
	'use strict';

	var theModel = Backbone.Model.extend({
		url: 'http://localhost:3100/add-video',
		// Default key/values
		defaults: {
			url: '',
			title: '',
			description: ''
		}
	});

	return theModel;
});
