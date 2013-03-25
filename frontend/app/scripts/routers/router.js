define([
	'jquery',
	'backbone',
	'../views/app',
	'../views/posts'
], function($, Backbone, AppView, PostsView) {
	'use strict';

	var Router = Backbone.Router.extend({
		appView: new AppView(),
		postsView: new PostsView(),

		routes: {
			'over-view-posts' : 'overViewPosts',
			'detail-view-post/:id' : 'detailViewPost',
			'*actions': 'defaultAction'
		},

		overViewPosts: function(){
			this.postsView.listDefault();
		},

		detailViewPost: function(id){
			this.postsView.detailDefault(id);
		},

		defaultAction: function() {
			Backbone.history.navigate('/404');
			this.appView.errorDefault();
		}

	});

	return Router;
});