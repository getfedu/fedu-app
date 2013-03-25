define([
	'jquery',
	'underscore',
	'backbone',
	'text!../templates/404.html'
], function( $, _, Backbone, The404Template) {
	'use strict';

	var AppView = Backbone.View.extend({

		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		el: '#app-wrapper',
		// compile template

		// delegated events
		events: {
		},

		initialize: function() {

		},

		render: function(target, value) {
			$(target).html(value);
		},

		errorDefault: function(){
			var errorView = '';
			var errorHash = '';
			errorHash = window.location.hash;
			errorView = _.template(The404Template, {errorHash: errorHash});

			this.render(this.el, errorView);
		}
	});

	return AppView;
});
