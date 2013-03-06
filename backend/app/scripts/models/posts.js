define([
	'underscore',
	'backbone'
], function( _, Backbone) {
	'use strict';

	var theModel = Backbone.Model.extend({
		url: function() {
            return  window.feduConfig.nodeUrl + '/add-post';
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
