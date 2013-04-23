define([
	'jquery',
	'underscore',
	'backbone',
	'socketIo',
	'vendor/fedu/config',
	'text!../templates/login_template.html',
	'../vendor/sha256',
	'jqueryCookie'
], function( $, _, Backbone, SocketIo, TheConfig, LoginTemplate) {
	'use strict';

	var AppView = Backbone.View.extend({

		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		el: '#app-wrapper',
		inner: '#app',
		collection: {},
		data: {},
		socket: null,

		// compile template

		// delegated events
		events: {
			'submit #login' : 'handleLogin',
			'click #acc' : 'account',
			'click #logout' : 'logout'
		},

		initialize: function() {
			// this.collection = new TheCollection();
			// this.collection.fetchData(this);
		},

		// Re-rendering the App just means refreshing the statistics -- the rest
		// of the app doesn't change.
		render: function(target, value) {
			// render function

			$(target).html(value);

		},

		// actions
		////////////////////////////////////////

		login: function(){
			this.render(this.inner, LoginTemplate);
		},

		account: function(){
			$.ajax({
				url: TheConfig.nodeUrl + '/account',
				xhrFields: {
					withCredentials: true
				}
			}).done(function(){
			}).fail(function(error){
				console.log(error.responseText);
			});
		},

		logout: function(){
			$.ajax({
				url: TheConfig.nodeUrl + '/logout',
				xhrFields: {
					withCredentials: true
				}
			}).done(function(){
			}).fail(function(error){
				console.log(error.responseText);
			});
		},

		// helper functions
		////////////////////////////////////////

		handleLogin: function(e) {
			e.preventDefault();
			var data = $(e.currentTarget).serializeArray();
			var password = data[0].value;
			password = CryptoJS.SHA256(password).toString();
			$.ajax({
				type: 'POST',
				url: TheConfig.nodeUrl + '/login',
				xhrFields: {
					withCredentials: true
				},
				data: {
					username: data[0].value,
					password: password
				}
			}).done(function(){
			}).fail(function(error){
				console.log(error.responseText);
			});
		},

	});

	return AppView;
});