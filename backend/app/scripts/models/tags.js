define([
	'underscore',
	'backbone',
	'../vendor/fedu/config'
], function( _, Backbone, TheConfig) {
	'use strict';

	var theModel = Backbone.Model.extend({
		idAttribute: '_id',
		urlRoot: function() {
            return TheConfig.nodeUrl + '/tag';
        },
		// Default key/values
		defaults: {
		    tagName: '',
		    description: '',
		    publishDate: '',
		    updateDate: '',
		    counter: 0
		}
	});

	return theModel;
});
