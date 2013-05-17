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
	$.ajaxSetup({ xhrFields: { withCredentials: true }, dataType: 'json'});

	var Router = Backbone.Router.extend({
		appView: new AppView(),
		postsView: new PostsView(),
		tagsView: new TagsView(),
		notificationsView: new NotificationsView(),
		pullRequestView: new PullRequestView(),
		dashboardView: new DashboardView(),
		statusBar: true,

		routes: {
			'add-post' : function(){ if(this.beforeRoute(true)){ this.addPost(); }},
			'list-posts' : function(){ if(this.beforeRoute(true)){ this.listPosts(); }},
			'edit-post' : function(){ if(this.beforeRoute(true)){ this.editPost(); }},
			'add-tag' : function(){ if(this.beforeRoute(true)){ this.addTag(); }},
			'list-tags' : function(){ if(this.beforeRoute(true)){ this.listTags(); }},
			'edit-tag' : function(){ if(this.beforeRoute(true)){ this.editTag(); }},
			'list-notifications' : function(){ if(this.beforeRoute(true)){ this.listNotifications(); }},
			'login' : function(){ if(this.beforeRoute(false)){ this.login(); }},
			'logout' : function(){ if(this.beforeRoute(true)){ this.logout(); }},
			'register' : function(){ if(this.beforeRoute(false)){ this.register(); }},
			'activate/:code' : function(code){ if(this.beforeRoute(false)){ this.activate(code); }},
			'recover-password' : function(){ if(this.beforeRoute(false)){ this.recoverPassword(); }},
			'recover-password/:code' : function(code){ if(this.beforeRoute(false)){ this.createNewPassword(code); }},
			'pull-request/:id' : function(id){ if(this.beforeRoute(true)){ this.pullRequest(id); }},
			'dashboard' : function(){ if(this.beforeRoute(true)){ this.dashboard(); }},
			'': function(){ if(this.beforeRoute(true)){ this.dashboard(); }},
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

		defaultAction: function(url) {
			Backbone.history.navigate('/dashboard', true);
			$('#message').html(_.template(MessageTemplate, { message: 'Sorry, but the site "' + url + '" is not known...', type: 'error'}));
		},

		/////////////////////////
		// Helpers
		/////////////////////////

		beforeRoute: function(auth){
			if(auth){
				var isAuth = this.isAuth();
				if(isAuth){
					if(!$('#app-wrapper').length){
						$('#wrapper').html(AppTemplate);
					}
					if(this.statusBar){
						new NotificationCenter();
						this.dashboardView.displayUsermenu();
						this.statusBar = false;
					}
				}
				return isAuth;
			} else {
				return this.isNotAuth();
			}
		},

		isAuth: function(){
			var sessionCookie = jqueryCookie('connect.sid');
			var userCookie = jqueryCookie('user_b');
			if(sessionCookie !== '' && sessionCookie !== null && userCookie !== '' && userCookie !== null){
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
		}

	});

	return Router;
});