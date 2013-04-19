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
		notificationCounter: $('.notification_wrapper .notification_counter'),
		notifications: $('.notification_wrapper .notifications'),
		currentNotifications: 0,
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
			this.collection.server_api.filter = 'all';
			this.collection.fetchData();
		},

		updateNotifications: function(e){
			e.preventDefault();
			var that = this;
			var id = $(e.currentTarget).attr('data-notification-id');
			var model = this.collection.get(id);

			var data = {
				updateDate: new Moment().format(),
				checked: true
			};

			model.set(data);
			model.save(null, {
                success: function(){
                	$(e.currentTarget).parent().html('<i class="icon-ok"></i>');
                	$(e.currentTarget).remove();
                	that.notifications.find('.notification_item[data-id="' + id + '"]').remove();
                    that.currentNotifications = that.notificationCounter.text();
                    that.countedNotifications(-1);
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
				templateItems += _.template(ListItemTemplate, {attributes: value.attributes, frontendUrl: TheConfig.frontendUrl, backendUrl: TheConfig.backendUrl });
			});
			this.render('#notifications_list', templateItems);
		},

		countedNotifications: function(count){
			if(count === 1){
				this.currentNotifications += 1;
			} else if(count === -1) {
				this.currentNotifications -= 1;
			} else {
				this.currentNotifications = count;
			}

			this.notificationCounter.show().html(this.currentNotifications);

			if(this.currentNotifications === 0){
				this.notificationCounter.hide();
			}

		},

	});

	return View;
});