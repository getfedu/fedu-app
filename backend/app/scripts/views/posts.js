define([
	'jquery',
	'underscore',
	'backbone',
	'../models/posts',
	'text!../templates/posts/add_template.html'
], function( $, _, Backbone, TheModel, addTemplate ) {
	'use strict';

	var VideoView = Backbone.View.extend({

		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		el: '#app-wrapper',
		model: {},

		// compile template
		template: _.template(addTemplate, { test: 'a Test Value' }),

		// delegated events
		events: {
			'click .test' : 'exampleFunction',
			'submit form#add_post' : 'addPost'
		},

		initialize: function() {
			// render default template (form)
			$(this.el).html(this.template);
			this.model = new TheModel();
		},

		// Re-rendering the App just means refreshing the statistics -- the rest
		// of the app doesn't change.
		render: function() {
			// render function

		},

		// helper functions
		////////////////////////////////////////
		exampleFunction: function() {
		},

		addPost: function(e){
			e.preventDefault();
			var array = $('form').serializeArray();
			console.log(array);
			this.model.set({
				title: array[0].value,
				videoUrl: array[1].value,
				description: array[2].value,
			});

			this.model.save(null, {
                success: function (model, response) {
                    $('#message').text('saved!');
				},
                error: function (model, response) {
                    $('#message').text('not saved! something went wrong.');
				}
			});

		}

	});

	return VideoView;
});
