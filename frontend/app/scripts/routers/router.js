define([
	'jquery',
	'backbone',
	'../views/app',
	'../views/posts'
], function($, Backbone, AppView, PostsView) {
	'use strict';

	var appView = new AppView();
	var postsView = new PostsView();

	var Router = Backbone.Router.extend({
		routes:{
			'over-view-posts' : 'overViewPosts',
			'*actions': 'defaultAction'
		},

		overViewPosts : function(){
			postsView.render('over-view-posts');
		},

		defaultAction: function() {
			console.log('routing point - defaultAction');
			appView.render();
		}

	});

	return Router;
});