define([
	'jquery',
	'underscore',
	'backbone',
	'../collections/posts',
	'text!../templates/posts/video.html',
	'text!../templates/posts/video_items.html'
], function( $, _, Backbone, TheCollection, VideoTemplate, VideoItemsTemplate) {
	'use strict';

	var PostsView = Backbone.View.extend({

		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		el: '#app-wrapper',
		collection: {},

		// delegated events
		events: {
			'click .test' : 'exampleFunction'
		},

		initialize: function() {
			// render default template (form)
			$(this.el).html(this.template);
			this.collection = new TheCollection();
		},

		// Re-rendering the App just means refreshing the statistics -- the rest
		// of the app doesn't change.
		render: function(target, value) {

			$(target).html(value);

		},

		listPosts: function(){ // called from collections/video.js
			this.render(this.el, VideoTemplate);

			var templateItems = '';

			_.each(this.collection.models, function(value){
				templateItems += _.template(VideoItemsTemplate, {attributes: value.attributes});
			});

			this.render('#all-videos', templateItems);
		},

		// helper functions
		////////////////////////////////////////
		exampleFunction: function() {
		},

		getPosts: function(){

			var that = this;
			this.collection.fetch({
			    success: function(collection) {
			        console.log('success - data of %s is fetched', collection);
			        that.listPosts();
			    },
			    error: function(){
			        console.log('error - no data was fetched');
			    }
			});
		}

	});

	return PostsView;
});
