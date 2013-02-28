define([
	'underscore',
	'backbone'
], function( _, Backbone) {
	'use strict';

	var theModel = Backbone.Model.extend({
		url: 'url',
		// Default key/values
		defaults: {
			title: 'a Title',
			author: 'an Author'
		}
	});

	return theModel;
});
