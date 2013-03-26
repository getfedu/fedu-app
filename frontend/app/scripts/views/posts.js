define([
	'jquery',
	'underscore',
	'backbone',
	'../collections/posts',
	'../models/posts',
	'text!../templates/posts/video.html',
	'text!../templates/posts/grid_video_items.html',
	'text!../templates/posts/info_video_items.html',
	'text!../templates/posts/player_video_items.html',
	'text!../templates/posts/detail_video_view.html',
	'text!../templates/posts/detail_video_content.html'
], function( $, _, Backbone, TheCollection, TheModel, VideoTemplate, GridVideoItemsTemplate, InfoVideoItemsTemplate, PlayerVideoItemsTemplate, DetailVideoViewTemplate, DetailVideoContentTemplate) {
	'use strict';

	var PostsView = Backbone.View.extend({

		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		el: '#app-wrapper',
		collection: {},
		viewType: 'grid',

		// delegated events
		events: {
			'click .type' : 'setViewType',
			'click .video_container' : 'addVideoIframe',
			'click .load_more' : 'infiniteLoad'
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

		listDefault: function(){
			this.render(this.el, VideoTemplate);
			$('.type[data-type=' + this.viewType + ']').addClass('active'); // set type button active-state
			// set page start to 0
			this.collection.goTo(0);
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

			this.render('#all_videos', templateItems);
		},

		detailDefault: function(id){
			this.render(this.el, DetailVideoViewTemplate);
			this.getPost(id);
		},

		listPost: function(results){
			var templateDetailView = '';
			templateDetailView = _.template(DetailVideoContentTemplate, {attributes: results[0]});

			this.render('.detail_view', templateDetailView);

		},

		// helper functions
		////////////////////////////////////////

		getPosts: function(){
			var that = this;

			this.collection.fetch({
			    success: function(collection) {
					that.collection = collection;
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
		},

		getPost: function(id){
			var model = new TheModel({_id: id});
			var that = this;
			model.fetch({
				success: function(model, response){
					that.listPost(response);
				}
			});
		},

		addVideoIframe: function(e){
			var videoUrl = $(e.currentTarget).attr('data-video');
			$(e.currentTarget).removeClass('no_player').append('<iframe src="' + videoUrl + '?portrait=0&byline=0&title=0&autoplay=1&color=00adef&showinfo=0&theme=light&autohide=0&fs=1" frameborder="0" allowfullscreen></iframe>');
			$(e.currentTarget).find('iframe').fadeIn();
		},

		infiniteLoad: function(e){
			e.preventDefault();
			var that = this;

			this.collection.nextPage({
				update: true, // add to collection
				remove: false,
				success: function(){
					that.listPosts();
				}
			});
		}

	});

	return PostsView;
});