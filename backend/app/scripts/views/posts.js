define([
	'jquery',
	'underscore',
	'backbone',
	'../collections/posts',
	'../models/posts',
	'text!../templates/posts/add_template.html',
	'text!../templates/posts/list_template.html',
	'text!../templates/posts/list_item_template.html',
], function( $, _, Backbone, TheCollection, TheModel, AddTemplate, ListTemplate, ListItemTemplate ) {
	'use strict';

	var VideoView = Backbone.View.extend({

		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		el: '#app-wrapper',
		collection: {},
		model: {},

		// delegated events
		events: {
			'submit form#add_post' : 'savePost',
			'click button.delete' : 'deletePost',
		},

		initialize: function() {
			this.model = new TheModel();
			this.collection = new TheCollection();
			this.collection.on('change', function(){
				console.log('hasChanges');
			});
		},

		// Re-rendering the App just means refreshing the statistics -- the rest
		// of the app doesn't change.
		render: function(target, value) {
			// render function
			$(target).html(value);
		},

		// actions
		////////////////////////////////////////

		addPost: function(){
			this.render(this.el, _.template(AddTemplate));
		},

		listPosts: function(){ // called from collections/video.js
			this.render(this.el, ListTemplate);
			var templateItems = '';
			var that = this;
			this.collection.fetch({
			    success: function(collection) {
					_.each(collection.models, function(value){
						templateItems += _.template(ListItemTemplate, {attributes: value.attributes});
			        });
			        that.render('#posts_list', templateItems);
			    },
			    error: function(){
			        console.log('error - no data was fetched');
			    }
			});
		},

		// helpers
		////////////////////////////////////////

		savePost: function(e){
			e.preventDefault();
			var array = $('form').serializeArray();
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
		},

		deletePost: function(e){
			var id = $(e.currentTarget).attr('data-id');
		}


	});

	return VideoView;
});
