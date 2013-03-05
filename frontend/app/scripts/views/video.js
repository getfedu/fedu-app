define([
	'jquery',
	'underscore',
	'backbone',
	'text!../templates/video/video.html',
	'text!../templates/video/video_items.html',
	'../collections/video'
], function( $, _, Backbone, VideoTemplate, VideoItemsTemplate, TheCollection) {
	'use strict';

	var VideoView = Backbone.View.extend({

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
			
			this.collection = new TheCollection();
			this.collection.fetchData(this);
		},

		// Re-rendering the App just means refreshing the statistics -- the rest
		// of the app doesn't change.
		render: function() {
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

	return VideoView;
});
