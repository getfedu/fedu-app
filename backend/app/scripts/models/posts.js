define([
	'underscore',
	'backbone'
], function( _, Backbone) {
	'use strict';

	var theModel = Backbone.Model.extend({
		idAttribute: '_id',
		urlRoot: function() {
            return  window.feduConfig.nodeUrl + '/post';
        },
		// Default key/values
		defaults: {
			title: '',
			videoUrl: '',
			description: ''
		}
	});

	return theModel;
});
