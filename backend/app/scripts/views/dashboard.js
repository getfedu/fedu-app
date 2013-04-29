define([
	'jquery',
	'underscore',
	'backbone',
	'views/notification_center',
	'text!../templates/dashboard/dashboard_template.html'
], function( $, _, Backbone, NotificationCenter, DashboardTemplate) {
	'use strict';

	var View = Backbone.View.extend({

		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		el: '#app-wrapper',
		inner: '#app',

		// delegated events
		events: {
			// 'click #logout' : 'logout'
		},

		initialize: function() {
			this.initNotficationCenter();
		},

		// Re-rendering the App just means refreshing the statistics -- the rest
		// of the app doesn't change.
		render: function(target, value) {
			// render function
			$(target).html(value);
		},

		// actions
		////////////////////////////////////////

		showDashboard: function(){
			this.render(this.inner, DashboardTemplate);
		},

		// helper functions
		////////////////////////////////////////

		initNotficationCenter: function() {
			new NotificationCenter();
		}

	});

	return new View();
});