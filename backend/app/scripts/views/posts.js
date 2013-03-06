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

	var View = Backbone.View.extend({

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
			this.collection.on('postsFetched', this.getData, this );
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
			this.render(this.el, _.template(ListTemplate));
			this.collection.fetchData();
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
			var model = this.collection.get(id);
			var that = this;
			model.destroy({
				success: function(model, response) {
					that.getData();
				},
				error: function(){
				},
				wait: true
			});
		},

		getData: function(){
			var templateItems = '';
			_.each(this.collection.models, function(value){
				templateItems += _.template(ListItemTemplate, {attributes: value.attributes, cid: value.cid});
			});
			this.render('#posts_list', templateItems);
		}
	});

	return View;
});
