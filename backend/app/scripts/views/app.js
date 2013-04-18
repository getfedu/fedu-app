define([
	'jquery',
	'underscore',
	'backbone',
	'text!../templates/login_template.html',
	'jqueryCookie'
], function( $, _, Backbone, LoginTemplate) {
	'use strict';

	var AppView = Backbone.View.extend({

		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		el: '#app-wrapper',
		inner: '#app',
		collection: {},
		data: {},

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
				url: 'http://localhost:3100/account'
			}).done(function(r){
				console.log(r);
			}).fail(function(error){
				console.log(error.responseText);
			});
		},

		logout: function(){
			$.ajax({
				type: 'POST',
				url: 'http://localhost:3100/logout',
				data: {
					userId: '516e6b10fc12f90441000001'
				}
			}).done(function(r){
				console.log(r);
			}).fail(function(error){
				console.log(error.responseText);
			});
		},

		// helper functions
		////////////////////////////////////////
		handleLogin: function(e) {
			e.preventDefault();
			var data = $(e.currentTarget).serializeArray();

			var jqXHR = $.ajax({
				type: 'POST',
				url: 'http://localhost:3100/login',
				data: {
					username: data[0].value,
					password: data[1].value
				}
			}).fail(function(error){
				console.log(error.responseText);
			});

			jqXHR.done(function(data, textStatus, jqXHR) {
				console.log(jqXHR.getResponseHeader('Set-Cookie'));
				console.log(data);
				this.data = data;
			});
		},

	});

	return AppView;
});