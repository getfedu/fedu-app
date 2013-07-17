define([
	'jquery',
	'underscore',
	'backbone',
	'json!../../settings.json',
	'text!../templates/dashboard/dashboard_template.html',
	'jqueryCookie'
], function( $, _, Backbone, TheConfig, DashboardTemplate, jqueryCookie ) {
	'use strict';

	var View = Backbone.View.extend({

		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		el: '#wrapper',
		inner: '#app',
		username: '#username',

		// delegated events
		events: {
			// 'click #logout' : 'logout'
		},

		initialize: function(){
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
			this.displayUsermenu();
		},

		// helper functions
		////////////////////////////////////////

		displayUsermenu: function(){
			var that = this;
			$.ajax({
				url: TheConfig.nodeUrl + '/user'
			}).done(function(user){
				that.render(that.username, '<i class="icon-user"></i> ' + user.username);
			}).fail(function(error){
				if(error.status === 401){
					jqueryCookie('user_b', '', { path: '/' });
					window.location.reload(false);
				}
				console.log(error.responseText);
			});
		}

	});

	return View;
});