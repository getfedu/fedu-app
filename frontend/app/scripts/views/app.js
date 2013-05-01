define([
	'jquery',
	'underscore',
	'backbone',
	'text!../templates/404.html',
	'text!../templates/login/logged_out_template.html',
	'../vendor/fedu/options',
	'jqueryCookie'
], function( $, _, Backbone, The404Template, LogoutTemplate, TheOption, jqueryCookie) {
	'use strict';

	var AppView = Backbone.View.extend({

		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		el: '#wrap',
		appWrapper: '#app-wrapper',
		username: '#username',

		// delegated events
		events: {
			'click #login_twitter' : 'redirectToTwitter',
			'click #login_facebook' : 'redirectToFacebook',
			'click #logout' : 'logout'
		},

		initialize: function() {
			this.displayUsermenu();
		},

		render: function(target, value) {
			$(target).html(value);
		},

		redirectToTwitter: function(e){
			e.preventDefault();
			window.open( TheOption.nodeUrl + '/auth/twitter', '_blank', 'toolbar=0, menubar=0, width=600, height=600');
		},

		redirectToFacebook: function(e){
			e.preventDefault();
			window.open( TheOption.nodeUrl + '/auth/facebook', '_blank', 'toolbar=0, menubar=0, width=600, height=600');
		},

		errorDefault: function(){
			var errorView = '';
			var errorHash = '';
			errorHash = window.location.hash;
			errorView = _.template(The404Template, {errorHash: errorHash});

			this.render(this.appWrapper, errorView);
		},

		// helper functions
		////////////////////////////////////////

		isAuth: function(){
			var sessionCookie = jqueryCookie('connect.sid');
			var userCookie = jqueryCookie('user_f');
			if(sessionCookie !== '' && sessionCookie !== null && userCookie !== '' && userCookie !== null){
				return true;
			} else {
				return false;
			}
		},

		displayUsermenu: function(){
			var that = this;
			if(this.isAuth()){
				$.ajax({
					url: TheOption.nodeUrl + '/username',
					xhrFields: {
						withCredentials: true
					}
				}).done(function(username){
					that.render(that.username, username);
					that.render($('#user_actions'), LogoutTemplate);
				}).fail(function(error){
					console.log(error.responseText);
				});
			}
		},

		logout: function(){
			var that = this;
			$.ajax({
				url: TheOption.nodeUrl + '/logout',
				xhrFields: {
					withCredentials: true
				}
			}).done(function(res){
				window.location.reload();
			}).fail(function(error){
				console.log(error.responseText);
			});
		}

	});

	return AppView;
});
