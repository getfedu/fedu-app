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
			'add-post' : 'addPost',
			'list-posts' : 'listPosts',
			'edit-post' : 'editPost',
			'*actions': 'defaultAction'
		},

		addPost: function(){
            this.postsView.addPost();
		},

		listPosts: function(){
			this.postsView.listPosts();
		},

		editPost: function(){
			this.postsView.listPosts();
			Backbone.history.navigate('/list-posts', false);
		},

		defaultAction: function() {
			console.log('routing point - defaultAction');
			this.appView.render();
		}

	});

	return Router;
});