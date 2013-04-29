define([
	'jquery',
	'backbone',
    '../views/login',
], function($, Backbone, AppView) {
	'use strict';

	var Router = Backbone.Router.extend({
		appView: new AppView(),
		routes: {
			'add-post' : 'addPost',
			'list-posts' : 'listPosts',
			'edit-post' : 'editPost',
			'add-tag' : 'addTag',
			'list-tags' : 'listTags',
			'edit-tag' : 'editTag',
			'list-notifications' : 'listNotifications',
			'login' : 'login',
			'logout' : 'logout',
			'register' : 'register',
			'activate/:code' : 'activate',
			'recover-password' : 'recoverPassword',
			'recover-password/:code' : 'createNewPassword',
			'pull-request/:id' : 'pullRequest',
			'*actions': 'defaultAction'
		},

		// Post
		addPost: function(){
			require([
				'views/posts'
			], function(View) {
				View.addPost();
			});
		},

		listPosts: function(){
			require([
				'views/posts'
			], function(View) {
				View.listPosts();
			});
		},

		editPost: function(){
			require([
				'views/posts'
			], function(View) {
				View.listPosts();
				Backbone.history.navigate('/list-posts', false);
			});
		},

		// Tag
		addTag: function(){
			require([
				'views/tags'
			], function(View) {
				View.addTag();
			});
		},

		listTags: function(){
			require([
				'views/tags'
			], function(View) {
				View.listTags();
			});
		},

		editTag: function(){
			require([
				'views/tags'
			], function(View) {
				View.listTags();
				Backbone.history.navigate('/list-tags', false);
			});
		},

		// Notifications
		listNotifications: function(){
			require([
				'views/notifications'
			], function(View) {
				View.listNotifications();
			});
		},

		// Pull request
		pullRequest: function(id){
			require([
				'views/pull_request'
			], function(View) {
				View.detailPullRequest(id);
			});
		},

		//Login
		login: function(){
			this.appView.login();
		},

		logout: function(){
			this.appView.logout();
		},

		register: function(){
			this.appView.register();
		},

		activate: function(code){
			this.appView.activate(code);
		},

		recoverPassword: function(){
			this.appView.recoverPassword();
		},

		createNewPassword: function(code){
			this.appView.createNewPassword(code);
		},

		defaultAction: function() {
			this.appView.render();
		}

	});

	return Router;
});