define([
	'jquery',
	'underscore',
	'backbone',
    '../views/login',
    '../views/posts',
    '../views/tags',
    '../views/notifications',
    '../views/pull_request',
    '../views/dashboard',
    '../views/notification_center',
    'jqueryCookie',
    'text!../templates/message_template.html',
    'text!../templates/app_template.html'
], function($, _, Backbone, AppView, PostsView, TagsView, NotificationsView, PullRequestView, DashboardView, NotificationCenter, jqueryCookie, MessageTemplate, AppTemplate) {
	'use strict';

	// ajax settings (sent cors cookies)
	$.ajaxSetup({ xhrFields: { withCredentials: true }});

	var Router = Backbone.Router.extend({
		appView: new AppView(),
		postsView: new PostsView(),
		tagsView: new TagsView(),
		notificationsView: new NotificationsView(),
		pullRequestView: new PullRequestView(),
		dashboardView: new DashboardView(),
		firstNotificationInit: true,

		routes: {
			'add-post' : function(){ if(this.isAuth()){ this.addPost(); }},
			'list-posts' : function(){ if(this.isAuth()){ this.listPosts(); }},
			'edit-post' : function(){ if(this.isAuth()){ this.editPost(); }},
			'add-tag' : function(){ if(this.isAuth()){ this.addTag(); }},
			'list-tags' : function(){ if(this.isAuth()){ this.listTags(); }},
			'edit-tag' : function(){ if(this.isAuth()){ this.editTag(); }},
			'list-notifications' : function(){ if(this.isAuth()){ this.listNotifications(); }},
			'login' : function(){ if(this.isNotAuth()){ this.login(); }},
			'logout' : function(){ if(this.isAuth()){ this.logout(); }},
			'register' : function(){ if(this.isNotAuth()){ this.register(); }},
			'activate/:code' : function(code){ if(this.isNotAuth()){ this.activate(code); }},
			'recover-password' : function(){ if(this.isNotAuth()){ this.recoverPassword(); }},
			'recover-password/:code' : function(code){ if(this.isNotAuth()){ this.createNewPassword(code); }},
			'pull-request/:id' : function(id){ if(this.isAuth()){ this.pullRequest(id); }},
			'dashboard' : function(){ if(this.isAuth()){ this.dashboard(); }},
			'': function(){ if(this.isAuth()){ this.dashboard(); }},
			'*actions': 'defaultAction'
		},

		isAuth: function(){
			var sessionCookie = jqueryCookie('connect.sid');
			var userCookie = jqueryCookie('user_b');
			if(sessionCookie !== '' && sessionCookie !== null && userCookie !== '' && userCookie !== null){
				if($('#app-wrapper').length === 0){
					$('#wrapper').html(AppTemplate);
				}

				if(this.firstNotificationInit){
					new NotificationCenter();
					this.firstNotificationInit = false;
				}

				return true;
			} else {
				Backbone.history.navigate('/login', true);
				$('#login_message').html(_.template(MessageTemplate, { message: 'Sorry, for this action you have to sign in.', type: 'error'}));
			}
		},

		isNotAuth: function(){
			var userCookie = jqueryCookie('user_b');
			if(userCookie === '' || userCookie === null){
				return true;
			} else {
				Backbone.history.navigate('/dashboard', true);
				$('#message').html(_.template(MessageTemplate, { message: 'Sorry, for this action you have to sign out.', type: 'error'}));
			}
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

		// Dashboard
		dashboard: function(){
			this.dashboardView.showDashboard();
		},

		defaultAction: function() {
			this.appView.render();
		}

	});

	return Router;
});