define([
	'jquery',
	'underscore',
	'backbone',
	'text!../templates/login/login_template.html',
], function( $, _, Backbone, LoginTemplate) {
	'use strict';

	var View = Backbone.View.extend({

		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		el: 'body',
		appWrapper: '#app-wrapper',
		// compile template

		// delegated events
		events: {
			// 'click .login' : 'initLogin'
		},

		initialize: function() {
		},

		render: function(target, value) {
			$(target).html(value);
		},

		loginSuccessView: function(){
			window.opener.location.reload();
			window.close();
		},

		loginErrorView: function(){
			$(this.el).html();
			this.render($(this.el), 'Error - something went wrong, please try it again!');
		}

		// helper functions
		////////////////////////////////////////



	});

	return new View();
});
