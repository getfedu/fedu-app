define([
	'jquery',
	'underscore',
	'backbone',
	'vendor/fedu/config',
	'text!../templates/app_template.html',
	'text!../templates/login/login_template.html',
	'text!../templates/login/register_template.html',
	'text!../templates/login/recover_password_template.html',
	'text!../templates/login/create_new_password_template.html',
	'text!../templates/message_template.html',
	'jqueryCookie',
	'jsHashes'
], function( $, _, Backbone, TheConfig, AppTemplate, LoginTemplate, RegisterTemplate, RecoverPasswordTemplate, CreateNewPasswordTemplate, MessageTemplate, jqueryCookie, jsHashes) {
	'use strict';

	var View = Backbone.View.extend({

		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		el: '#wrapper',
		SHA256: new jsHashes.SHA256(),

		// delegated events
		events: {
			'submit #login' : 'handleLogin',
			'submit #register' : 'handleRegister',
			'submit #recover_password' : 'handleRecoverPassword',
			'submit #create_new_password' : 'handleCreateNewPassword',
			'click #hash' : 'hashPassPhrase',
			'click #acc' : 'account',
			'click #logout' : 'logout'
		},

		initialize: function() {
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
			this.render(this.el, LoginTemplate);
		},

		register: function(){
			this.render(this.el, RegisterTemplate);
		},

		activate: function(code){
			var that = this;
			$.ajax({
				url: TheConfig.nodeUrl + '/activate/' + code
			}).done(function(res){
				if(res.key === 'ok'){
					that.render('#login_message', _.template(MessageTemplate, { message: res.message, type: 'success'}));
					Backbone.history.navigate('/login', true);
				} else {
					that.render('#login_message', _.template(MessageTemplate, { message: res.message, type: 'error'}));
				}
			}).fail(function(res){
				var txt = JSON.parse(res.responseText);
				that.render('#login_message', _.template(MessageTemplate, { message: txt.message, type: 'error'}));
				Backbone.history.navigate('/register', true);
			});
		},

		logout: function(){
			var that = this;
			$.ajax({
				url: TheConfig.nodeUrl + '/logout'
			}).done(function(res){
				Backbone.history.navigate('/login', true);
				that.render('#login_message', _.template(MessageTemplate, { message: res.message, type: 'success'}));
			}).fail(function(error){
				console.log(error.responseText);
			});
		},

		// account: function(){
		// 	console.log(this.userId);
		// 	$.ajax({
		// 		url: TheConfig.nodeUrl + '/account'
		// 	}).done(function(){
		// 	}).fail(function(error){
		// 		console.log(error.responseText);
		// 	});
		// },

		recoverPassword: function(){
			this.render(this.el, RecoverPasswordTemplate);
		},

		createNewPassword: function(code){
			this.render(this.el, _.template(CreateNewPasswordTemplate, { code: code }));
		},

		// helper functions
		////////////////////////////////////////

		handleLogin: function(e) {
			e.preventDefault();
			var data = $(e.currentTarget).serializeArray();
			var password = data[1].value;
			password = this.SHA256.hex(password);
			var that = this;
			if(!navigator.cookieEnabled){
				this.render('#login_message', _.template(MessageTemplate, { message: 'Sorry.. You have to enable Cookies, to login', type: 'error'}));
			} else {
				$.ajax({
					type: 'POST',
					url: TheConfig.nodeUrl + '/login',
					data: {
						username: data[0].value,
						password: password
					}
				}).done(function(){
					that.render(that.el, AppTemplate);
					Backbone.history.navigate('/dashboard', true);
					$('.alert').alert('close');
				}).fail(function(res){
					var msg = JSON.parse(res.responseText);
					that.render('#login_message', _.template(MessageTemplate, { message: msg.message, type: 'error'}));
				});

			}
		},

		handleRegister: function(e){
			e.preventDefault();
			var data = $(e.currentTarget).serializeArray();
			var password = data[1].value;
			password = this.SHA256.hex(password);
			var that = this;
			$.ajax({
				type: 'POST',
				url: TheConfig.nodeUrl + '/register',
				data: {
					username: data[0].value,
					password: password
				}
			}).done(function(res){
				Backbone.history.navigate('/login', true);
				that.render('#login_message', _.template(MessageTemplate, { message: res.message, type: 'success'}));
			}).fail(function(res){
				var msg = JSON.parse(res.responseText);
				that.render('#login_message', _.template(MessageTemplate, { message: msg.message, type: 'error'}));
			});
		},

		hashPassPhrase: function(e){
			if($(e.currentTarget).is(':checked')){
				$('#password').attr('type', 'password');
			} else {
				$('#password').attr('type', 'text');
			}
		},

		handleRecoverPassword: function(e){
			e.preventDefault();
			var data = $(e.currentTarget).serializeArray();
			var that = this;
			$.ajax({
				type: 'POST',
				url: TheConfig.nodeUrl + '/recover-password',
				data: {
					username: data[0].value,
				}
			}).done(function(res){
				Backbone.history.navigate('/login', true);
				that.render('#login_message', _.template(MessageTemplate, { message: res.message, type: 'success'}));
			}).fail(function(res){
				var msg = JSON.parse(res.responseText);
				that.render('#login_message', _.template(MessageTemplate, { message: msg.message, type: 'error'}));
			});
		},

		handleCreateNewPassword: function(e){
			e.preventDefault();
			var data = $(e.currentTarget).serializeArray();
			var password = data[0].value;
			password = this.SHA256.hex(password);
			var that = this;
			$.ajax({
				type: 'POST',
				url: TheConfig.nodeUrl + '/recover-password/' + data[1].value,
				data: {
					password: password,
				}
			}).done(function(res){
				Backbone.history.navigate('/login', true);
				that.render('#login_message', _.template(MessageTemplate, { message: res.message, type: 'success'}));
			}).fail(function(res){
				var msg = JSON.parse(res.responseText);
				that.render('#login_message', _.template(MessageTemplate, { message: msg.message, type: 'error'}));
			});
		}

	});

	return View;
});