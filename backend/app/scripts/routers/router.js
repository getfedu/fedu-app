define([
	'jquery',
	'backbone',
    '../views/app',
	'../views/posts',
	'../views/tags',
	'../views/notifications',
	'../views/pull_request',
], function($, Backbone, AppView, PostsView, TagsView, NotificationsView, PullRequestView) {
	'use strict';

	var Router = Backbone.Router.extend({
		appView: new AppView(),
		postsView: new PostsView(),
		tagsView: new TagsView(),
		notificationsView: new NotificationsView(),
		pullRequestView: new PullRequestView(),
		routes: {
			'add-post' : 'addPost',
			'list-posts' : 'listPosts',
			'edit-post' : 'editPost',
			'add-tag' : 'addTag',
			'list-tags' : 'listTags',
			'edit-tag' : 'editTag',
			'list-notifications' : 'listNotifications',
			'login' : 'login',
			'register' : 'register',
			'activate/:code' : 'activate',
			'pull-request/:id' : 'pullRequest',
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

		// Pull request
		pullRequest: function(id){
			this.pullRequestView.detailPullRequest(id);
		},

		//Login
		login: function(){
			this.appView.login();
		},

		register: function(){
			this.appView.register();
		},

		activate: function(code){
			this.appView.activate(code);
		},

		defaultAction: function() {
			this.appView.render();
		}

	});

	return Router;
});