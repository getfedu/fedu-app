define([
	'jquery',
	'backbone',
    '../views/app',
	'../views/posts',
	'../views/tags',
	'../views/notifications'
], function($, Backbone, AppView, PostsView, TagsView, NotificationsView) {
	'use strict';

	var Router = Backbone.Router.extend({
		appView: new AppView(),
		postsView: new PostsView(),
		tagsView: new TagsView(),
		notificationsView: new NotificationsView(),
		routes:{
			'add-post' : 'addPost',
			'list-posts' : 'listPosts',
			'edit-post' : 'editPost',
			'add-tag' : 'addTag',
			'list-tags' : 'listTags',
			'edit-tag' : 'editTag',
			'list-notifications' : 'listNotifications',
			'login' : 'login',
			'*actions': 'defaultAction'
		},

		// Post
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

		// Tag
		addTag: function(){
			this.tagsView.addTag();
		},

		listTags: function(){
			this.tagsView.listTags();
		},

		editTag: function(){
			this.tagsView.listTags();
			Backbone.history.navigate('/list-tags', false);
		},

		// Notifications
		listNotifications: function(){
			this.notificationsView.listNotifications();

		},

		//Login
		login: function(){
			this.appView.login();
		},

		defaultAction: function() {
			this.appView.render();
		}

	});

	return Router;
});