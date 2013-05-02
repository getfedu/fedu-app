define([
	'jquery',
	'underscore',
	'backbone',
	'text!../templates/404.html',
	'text!../templates/login/user_menu_template.html',
	'../vendor/fedu/options'
], function( $, _, Backbone, The404Template, UserMenuTemplate, TheOption) {
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

		displayUsermenu: function(){
			var that = this;
			if(TheOption.isAuth()){
				$.ajax({
					url: TheOption.nodeUrl + '/user',
					xhrFields: {
						withCredentials: true
					}
				}).done(function(user){
					if(user.favoritePosts){
						TheOption.favorites = user.favoritePosts;
					}
					that.render($('#user_menu'), _.template(UserMenuTemplate, { username: '<i class="icon-user"></i>' + user.username }));
				}).fail(function(error){
					console.log(error.responseText);
				});
			}
		},

		logout: function(){
			$.ajax({
				url: TheOption.nodeUrl + '/logout',
				xhrFields: {
					withCredentials: true
				}
			}).done(function(){
				window.location.reload();
			}).fail(function(error){
				console.log(error.responseText);
			});
		}

	});

	return AppView;
});
