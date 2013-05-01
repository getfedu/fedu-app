define([
	'jquery',
	'underscore',
	'backbone',
	'text!../templates/404.html',
	'text!../templates/login/login_template.html',
], function( $, _, Backbone, The404Template, LoginTemplate) {
	'use strict';

	var AppView = Backbone.View.extend({

		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		el: '#wrap',
		appWrapper: '#app-wrapper',
		// compile template

		// delegated events
		events: {
			'click .login' : 'initLogin',
			'click .login_twitter' : 'redirectToTwitter'
		},

		initialize: function() {

		},

		render: function(target, value) {
			$(target).html(value);
		},

		initLogin: function(e){
			e.preventDefault();
			var locateLoginWrapper = $('.login_wrapper');
			this.render(locateLoginWrapper, LoginTemplate);
			locateLoginWrapper.toggle();
		},

		redirectToTwitter: function(e){
			e.preventDefault();
			window.open('http://localhost:3100/auth/twitter', '_blank', 'toolbar=0, menubar=0, width=600, height=600');
		},

		errorDefault: function(){
			var errorView = '';
			var errorHash = '';
			errorHash = window.location.hash;
			errorView = _.template(The404Template, {errorHash: errorHash});

			this.render(this.appWrapper, errorView);
		}
	});

	return AppView;
});
