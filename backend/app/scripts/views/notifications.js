define([
	'jquery',
	'underscore',
	'backbone',
	'../collections/notifications',
	'text!../templates/notifications/list_template.html',
	'text!../templates/notifications/list_item_template.html',
	'../vendor/fedu/config',
	'moment'
], function( $, _, Backbone, TheCollection, ListTemplate, ListItemTemplate, TheConfig, Moment) {
	'use strict';

	var View = Backbone.View.extend({

		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		el: '#app-wrapper',
		inner: '#app',
		collection: {},

		// delegated events
		events: {
			'click form#update_notifications button': 'updateNotifications'
		},

		initialize: function() {
			this.collection = new TheCollection();
			this.collection.on('notificationsFetched', this.getData, this );
		},

		// Re-rendering the App just means refreshing the statistics -- the rest
		// of the app doesn't change.
		render: function(target, value) {
			// render function
			$(target).html(value);
		},

		// actions
		////////////////////////////////////////
		listNotifications: function(){
			this.render(this.inner, _.template(ListTemplate));
			this.collection.fetchData();
		},

		updateNotifications: function(e){
			e.preventDefault();
			var id = $(e.currentTarget).attr('data-notification-id');
			var model = this.collection.get(id);
			
			var data = {
				updateDate: new Moment().format(),
				checked: true
			};

			model.set(data);
			model.save(null, {
                success: function(){
                    Backbone.history.loadUrl( Backbone.history.fragment ); // refresh site without any hash changes
				},
                error: function(){
                	//console.log('sorry');
                }
			});

		},

		// helpers
		////////////////////////////////////////
		getData: function(){
			var templateItems = '';
			_.each(this.collection.models, function(value){
				templateItems += _.template(ListItemTemplate, {attributes: value.attributes, frontendUrl: TheConfig.frontendUrl});
			});
			this.render('#notifications_list', templateItems);
		}

	});

	return View;
});