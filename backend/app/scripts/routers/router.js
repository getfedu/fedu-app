define([
	'jquery',
	'underscore',
	'backbone',
    '../views/login',
    'jqueryCookie',
    'text!../templates/message_template.html',
], function($, _, Backbone, AppView, jqueryCookie, MessageTemplate) {
	'use strict';

	var Router = Backbone.Router.extend({
		appView: new AppView(),
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
					require(['text!templates/app_template.html'], function(AppTemplate) {
						$('#wrapper').html(AppTemplate);
					});
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
			require(['views/posts'], function(View) {
				View.addPost();
			});
		},

		listPosts: function(){
			require(['views/posts'], function(View) {
				View.listPosts();
			});
		},

		editPost: function(){
			require(['views/posts'], function(View) {
				View.listPosts();
				Backbone.history.navigate('/list-posts', false);
			});
		},

		// Tag
		addTag: function(){
			require(['views/tags'], function(View) {
				View.addTag();
			});
		},

		listTags: function(){
			require(['views/tags'], function(View) {
				View.listTags();
			});
		},

		editTag: function(){
			require(['views/tags'], function(View) {
				View.listTags();
				Backbone.history.navigate('/list-tags', false);
			});
		},

		// Notifications
		listNotifications: function(){
			require(['views/notifications'], function(View) {
				View.listNotifications();
			});
		},

		// Pull request
		pullRequest: function(id){
			require(['views/pull_request'], function(View) {
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

		// Dashboard
		dashboard: function(){
			require(['views/dashboard'], function(View) {
				View.showDashboard();
			});
		},

		defaultAction: function() {
			this.appView.render();
		}

	});

	return Router;
});