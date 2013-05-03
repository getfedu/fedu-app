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
			this.initNotficationCenter();
			this.displayUsermenu();
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
				url: TheConfig.nodeUrl + '/user',
				xhrFields: {
					withCredentials: true
				}
			}).done(function(user){
				that.render(that.username, '<i class="icon-user"></i> ' + user.username);
			}).fail(function(error){
				console.log(error.responseText);
			});
		}

	});

	return new View();
});