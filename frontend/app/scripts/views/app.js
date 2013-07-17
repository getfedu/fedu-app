define([
	'jquery',
	'underscore',
	'backbone',
	'text!../templates/404.html',
	'text!../templates/login/user_menu_template.html',
	'text!../templates/message_template.html',
	'text!../templates/about.html',
	'text!../templates/contact.html',
	'../vendor/fedu/options',
	'json!../../settings.json',
	'jqueryCookie'
], function( $, _, Backbone, The404Template, UserMenuTemplate, MessageTemplate, AboutTemplate, ContactTemplate, TheOption, TheConfig, jqueryCookie) {
	'use strict';

	var View = Backbone.View.extend({

		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		el: '#wrap',
		appWrapper: '#app-wrapper',
		username: '#username',

		// delegated events
		events: {
			'click #login_twitter' : 'redirectToTwitter',
			'click #login_facebook' : 'redirectToFacebook',
			'click #login_google' : 'redirectToGoogle',
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
			if(!navigator.cookieEnabled){
				this.render('#message', _.template(MessageTemplate, { message: 'Sorry.. You have to enable Cookies, to login', type: 'error'}));
			} else {
				window.open( TheConfig.nodeUrl + '/auth/twitter', '_blank', 'toolbar=0, menubar=0, width=600, height=600');
			}
		},

		redirectToFacebook: function(e){
			e.preventDefault();
			if(!navigator.cookieEnabled){
				this.render('#message', _.template(MessageTemplate, { message: 'Sorry.. You have to enable Cookies, to login', type: 'error'}));
			} else {
				window.open( TheConfig.nodeUrl + '/auth/facebook', '_blank', 'toolbar=0, menubar=0, width=600, height=600');
			}
		},

		redirectToGoogle: function(e){
			e.preventDefault();
			if(!navigator.cookieEnabled){
				this.render('#message', _.template(MessageTemplate, { message: 'Sorry.. You have to enable Cookies, to login', type: 'error'}));
			} else {
				window.open( TheConfig.nodeUrl + '/auth/google', '_blank', 'toolbar=0, menubar=0, width=600, height=600');
			}
		},

		errorDefault: function(){
			var errorView = '';
			var errorHash = '';
			errorHash = window.location.hash;
			errorView = _.template(The404Template, {errorHash: errorHash});

			this.render(this.breadcrumb, ''); //clean breadcrumb
			this.render(this.appWrapper, errorView);
		},

		about: function(){
			this.render(this.appWrapper, _.template(AboutTemplate));
		},

		contact: function(){
			this.render(this.appWrapper, _.template(ContactTemplate));
		},

		// helper functions
		////////////////////////////////////////

		displayUsermenu: function(){
			var that = this;
			if(TheOption.isAuth()){

				$.ajax({
					url: TheConfig.nodeUrl + '/user',
				}).done(function(user){
					if(user.favoritePosts){
						TheOption.favorites = user.favoritePosts;
					}
					if(user.ratedPosts){
						TheOption.rating = user.ratedPosts;
					}
					that.render($('#user_menu'), _.template(UserMenuTemplate, { username: '<i class="icon-user"></i>' + user.username }));
				}).fail(function(error){
					if(error.status === 401){
						jqueryCookie('user_f', '');
						window.reload();
					}
					console.log(error.responseText);
				});
			}
		},

		logout: function(){
			$.ajax({
				url: TheConfig.nodeUrl + '/logout',
			}).done(function(){
				window.location.reload();
			}).fail(function(error){
				console.log(error.responseText);
			});
		}

	});

	return View;
});
