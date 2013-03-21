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

		routes:{
			'over-view-posts' : 'overViewPosts',
			'*actions': 'defaultAction'
		},

		overViewPosts : function(){
			this.postsView.defaultStructure();
		},

		defaultAction: function() {
			console.log('routing point - defaultAction');
			this.appView.render();
		}

	});

	return Router;
});