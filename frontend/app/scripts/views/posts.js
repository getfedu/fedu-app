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

		// compile template
		template: _.template(VideoTemplate),

		// delegated events
		events: {
			'click .test' : 'exampleFunction'
		},

		initialize: function() {
			// render default template (form)
			$(this.el).html(this.template);
			var that = this;
			this.collection = new TheCollection();
			this.collection.fetch({
			    success: function(collection) {
			        console.log('success - data of %s is fetched', collection);
			        that.renderVideos();
			    },
			    error: function(){
			        console.log('error - no data was fetched');
			    }
			});
		},

		// Re-rendering the App just means refreshing the statistics -- the rest
		// of the app doesn't change.
		render: function(value) {

			console.log(value);

		},

		renderVideos: function(){ // called from collections/video.js

			var templateItems = '';

			_.each(this.collection.models, function(value, key){
				templateItems += _.template(VideoItemsTemplate, {attributes: value.attributes});
			});

			$('#all-videos').html(templateItems);

		},

		// helper functions
		////////////////////////////////////////
		exampleFunction: function() {
		},

	});

	return PostsView;
});
