define([
	'underscore',
	'backbone',
	'json!../../settings.json'
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
