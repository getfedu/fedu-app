define([
	'jquery',
	'underscore',
	'backbone',
	'text!../templates/404.html',
	'text!../templates/login/login_template.html',
	'../vendor/fedu/config',
	'jqueryCookie'
], function( $, _, Backbone, The404Template, LoginTemplate, TheConfig, jqueryCookie) {
	'use strict';

	var AppView = Backbone.View.extend({

		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		el: '#wrap',
		appWrapper: '#app-wrapper',
		loginWrapper: $('.login_wrapper'),
		// compile template

		// delegated events
		events: {
			'click .login' : 'initLogin',
			'click .login_twitter' : 'redirectToTwitter',
			'click .login_facebook' : 'redirectToFacebook',
		},

		initialize: function() {
			this.isAuth();
		},

		render: function(target, value) {
			$(target).html(value);
		},

		initLogin: function(e){
			e.preventDefault();
			this.render(this.loginWrapper, LoginTemplate);
			this.loginWrapper.toggle();
		},

		redirectToTwitter: function(e){
			e.preventDefault();
			window.open( TheConfig.nodeUrl + '/auth/twitter', '_blank', 'toolbar=0, menubar=0, width=600, height=600');
		},

		redirectToFacebook: function(e){
			e.preventDefault();
			window.open( TheConfig.nodeUrl + '/auth/facebook', '_blank', 'toolbar=0, menubar=0, width=600, height=600');
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
		}

	});

	return AppView;
});
