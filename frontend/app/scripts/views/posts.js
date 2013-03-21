define([
	'jquery',
	'underscore',
	'backbone',
	'../collections/posts',
	'text!../templates/posts/video.html',
	'text!../templates/posts/grid_video_items.html',
	'text!../templates/posts/info_video_items.html',
	'text!../templates/posts/player_video_items.html'
], function( $, _, Backbone, TheCollection, VideoTemplate, GridVideoItemsTemplate, InfoVideoItemsTemplate, PlayerVideoItemsTemplate) {
	'use strict';

	var PostsView = Backbone.View.extend({

		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		el: '#app-wrapper',
		collection: {},
		viewType: 'info',

		// delegated events
		events: {
			'click .type' : 'setViewType'
		},

		initialize: function() {
			// render default template (form)
			this.collection = new TheCollection();
		},

		// Re-rendering the App just means refreshing the statistics -- the rest
		// of the app doesn't change.
		render: function(target, value) {
			$(target).html(value);
		},

		defaultStructure: function(){
			this.render(this.el, VideoTemplate);
			$('.type[data-type=' + this.viewType + ']').addClass('active'); // set type button active-state
			this.getPosts();
		},

		listPosts: function(){

			var templateItems = '';
			var that = this;
			_.each(this.collection.models, function(value){
				if(that.viewType === 'grid'){
					templateItems += _.template(GridVideoItemsTemplate, {attributes: value.attributes});
				} else if(that.viewType === 'player'){
					templateItems += _.template(PlayerVideoItemsTemplate, {attributes: value.attributes});
				} else if(that.viewType === 'info'){
					templateItems += _.template(InfoVideoItemsTemplate, {attributes: value.attributes});
				}
			});

			this.render('#all-videos', templateItems);
		},

		// helper functions
		////////////////////////////////////////

		getPosts: function(){

			var that = this;
			this.collection.fetch({
			    success: function() {
			        that.listPosts();
			    },
			    error: function(){
			        console.log('error - no data was fetched');
			    }
			});
		},

		setViewType: function(e) {
			$('.type').removeClass('active');
			$(e.currentTarget).addClass('active');
			this.viewType = $(e.currentTarget).attr('data-type');
			this.listPosts();
		}

	});

	return PostsView;
});
