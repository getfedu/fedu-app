define([
	'underscore',
	'backbone',
	'../vendor/fedu/config'
], function( _, Backbone, TheConfig) {
	'use strict';

	var theModel = Backbone.Model.extend({
		idAttribute: '_id',
		urlRoot: function() {
            return TheConfig.nodeUrl + '/notification';
        },
		// Default key/values
		defaults: {
		    id: '',
		    title: '',
		    description: '',
		    publishDate: '',
		    updateDate: '',
		    checked: false
		}
	});

	return theModel;
});
