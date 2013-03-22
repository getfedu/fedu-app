define([
	'jquery',
	'underscore',
	'backbone',
	'../collections/posts',
	'text!../templates/posts/video.html',
	'text!../templates/posts/grid_video_items.html',
	'text!../templates/posts/info_video_items.html',
	'text!../templates/posts/player_video_items.html',
	'text!../templates/posts/detail_video_view.html',
	'text!../templates/posts/detail_video_content.html'
], function( $, _, Backbone, TheCollection, VideoTemplate, GridVideoItemsTemplate, InfoVideoItemsTemplate, PlayerVideoItemsTemplate, DetailVideoViewTemplate, DetailVideoContentTemplate) {
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

		listDefault: function(){
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

		detailDefault: function(id){
			this.render(this.el, DetailVideoViewTemplate);
			this.getPost(id);
		},

		listPost: function(id){
			var templateDetailView = '';
			var post = this.collection.where({_id: id});
			post = post[0].attributes;

			templateDetailView = _.template(DetailVideoContentTemplate, {attributes: post});

			this.render('.detail_view', templateDetailView);

		},

		// helper functions
		////////////////////////////////////////

		getPosts: function(){
			if(this.collection.length > 0){ // check, if collection already exists
				this.listPosts();
			} else {
				this.fetchData('getPosts');
			}

		},

		setViewType: function(e) {
			$('.type').removeClass('active');
			$(e.currentTarget).addClass('active');
			this.viewType = $(e.currentTarget).attr('data-type');
			this.listPosts();
		},

		getPost: function(id){
			if(this.collection.length > 0){  // check, if collection already exists
				this.listPost(id);
			} else {
				this.fetchData('getPost', id);
			}

		},

		fetchData: function(targetFunction, id){
			var that = this;
			this.collection.fetch({
			    success: function(collection) {
					that.collection = collection;

					switch(targetFunction){
					case 'getPost':
						that.listPost(id);
						break;
					case 'getPosts':
						that.listPosts();
						break;
					}

			    },
			    error: function(){
			        console.log('error - no data was fetched');
			    }
			});
		}

	});

	return PostsView;
});
