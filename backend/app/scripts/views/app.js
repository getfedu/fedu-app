define([
	'jquery',
	'underscore',
	'backbone',
	'socketIo',
	'vendor/fedu/config',
	'text!../templates/login_template.html',
	'text!../templates/register_template.html',
	'text!../templates/message_template.html',
	'../vendor/sha256',
	'jqueryCookie'
], function( $, _, Backbone, SocketIo, TheConfig, LoginTemplate, RegisterTemplate, MessageTemplate) {
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

		activate: function(code){
			var that = this;
			$.ajax({
				url: TheConfig.nodeUrl + '/activate/' + code,
				xhrFields: {
					withCredentials: true
				}
			}).done(function(res){
				if(res.key === 'ok'){
					that.render('#message', _.template(MessageTemplate, { message: res.message, type: 'success'}));
					Backbone.history.navigate('/login', true);
				} else {
					that.render('#message', _.template(MessageTemplate, { message: res.message, type: 'error'}));
				}
			}).fail(function(res){
				var txt = JSON.parse(res.responseText);
				that.render('#message', _.template(MessageTemplate, { message: txt.message, type: 'error'}));
				Backbone.history.navigate('/register', true);
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
			var that = this;
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
				Backbone.history.navigate('/list-posts', true);
				$('.alert').alert('close');
			}).fail(function(res){
				var msg = JSON.parse(res.responseText);
				that.render('#message', _.template(MessageTemplate, { message: msg.message, type: 'error'}));
			});
		},

		handleRegister: function(e){
			e.preventDefault();
			var data = $(e.currentTarget).serializeArray();
			var password = data[1].value;
			password = CryptoJS.SHA256(password).toString();
			var that = this;
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
			}).done(function(res){
				Backbone.history.navigate('/login', true);
				that.render('#message', _.template(MessageTemplate, { message: res.message, type: 'success'}));
                setTimeout(function() {
					$('.alert').alert('close');
                }, 5000);
			}).fail(function(res){
				var msg = JSON.parse(res.responseText);
				that.render('#message', _.template(MessageTemplate, { message: msg.message, type: 'error'}));
                setTimeout(function() {
					$('.alert').alert('close');
                }, 5000);
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