define([
	'jquery',
	'underscore',
	'backbone',
	'text!../templates/example_template.html'
], function( $, _, Backbone, ExampleTemplate) {
	'use strict';

	var AppView = Backbone.View.extend({

		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		el: '#app-wrapper',
		collection: {},

		// compile template
		template: _.template(ExampleTemplate, { test: 'a Test Value' }),

		// delegated events
		events: {
			'click .test' : 'exampleFunction'
		},

		initialize: function() {
			// this.collection = new TheCollection();
			// this.collection.fetchData(this);
		},

		// Re-rendering the App just means refreshing the statistics -- the rest
		// of the app doesn't change.
		render: function() {
			// render function

			$(this.el).html(this.template);

		},

		// helper functions
		////////////////////////////////////////
		exampleFunction: function() {
		},

	});

	return AppView;
});
