define([
	'jquery',
	'underscore',
	'backbone',
	'views/notification_center',
	'vendor/fedu/config',
	'text!../templates/dashboard/dashboard_template.html'
], function( $, _, Backbone, NotificationCenter, TheConfig, DashboardTemplate ) {
	'use strict';

	var View = Backbone.View.extend({

		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		el: '#app-wrapper',
		inner: '#app',
		username: '#username',

		// delegated events
		events: {
			// 'click #logout' : 'logout'
		},

		initialize: function() {
			this.initNotficationCenter();
			this.displayUsermenu();
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
		},

		displayUsermenu: function(){
			var that = this;
			$.ajax({
				url: TheConfig.nodeUrl + '/username',
				xhrFields: {
					withCredentials: true
				}
			}).done(function(username){
				that.render(that.username, username);
			}).fail(function(error){
				console.log(error.responseText);
			});
		}

	});

	return new View();
});