define([
	'jquery',
	'underscore',
	'backbone',
	'socketIo',
	'vendor/fedu/config',
	'text!../templates/login_template.html',
	'text!../templates/register_template.html',
	'../vendor/sha256',
	'jqueryCookie'
], function( $, _, Backbone, SocketIo, TheConfig, LoginTemplate, RegisterTemplate) {
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
			'submit #register' : 'handleRegister',
			'click #hash' : 'hashPassPhrase',
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

		register: function(){
			this.render(this.inner, RegisterTemplate);
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

		account: function(){
			console.log(this.userId);
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

		// helper functions
		////////////////////////////////////////

		handleLogin: function(e) {
			e.preventDefault();
			var data = $(e.currentTarget).serializeArray();
			var password = data[1].value;
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

		handleRegister: function(e){
			e.preventDefault();
			var data = $(e.currentTarget).serializeArray();
			var password = data[1].value;
			password = CryptoJS.SHA256(password).toString();
			$.ajax({
				type: 'POST',
				url: TheConfig.nodeUrl + '/register',
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

		hashPassPhrase: function(e){
			if($(e.currentTarget).is(':checked')){
				$('#password').attr('type', 'password');
			} else {
				$('#password').attr('type', 'text');
			}
		}

	});

	return AppView;
});