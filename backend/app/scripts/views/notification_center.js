define([
	'jquery',
	'underscore',
	'backbone',
	'../collections/notifications',
	'../models/notifications',
	'socketIo',
	'vendor/fedu/config'
], function($, _, Backbone, TheCollection, TheModel, SocketIo, TheConfig) {
    'use strict';

    var View = Backbone.View.extend({
    	el: '.notification_wrapper',
		socket: null,
		notificationWrapper: $('.notification_wrapper'),
		notification: $('.notification_wrapper .notifications'),
		notificationCounter: $('.notification_wrapper .notification_counter'),
		currentNotifications: 0,
		firstNotification: true,
		collection: {},

		// delegated events
		events: {
			'click .notifications .notification_item': 'removeNotification',
		},

		initialize: function(){
			this.collection = new TheCollection();
			this.collection.on('notificationsFetched', this.getData, this);
			this.collection.server_api.filter = 'partial';
			this.collection.fetchData();

			var that = this;
			this.socket = SocketIo.connect(TheConfig.websocketUrl);
			this.socket.on('connect', function(){
				that.notifyPost();
			});

		},

		notifyPost: function(){
			var that = this;
			var notification = '',
				description = '';

			this.socket.on('flagPost', function(data){

				if(that.firstNotification){ // clear default message
					that.notification.html('');
					that.firstNotification = false;
				}

				that.countedNotifications(+1);

				description = (data.description !== '') ? '<span class="notification_item description">' + data.description + '</span>' : '';
				notification = '<li class="notification_item latest"><a href="' + TheConfig.frontendUrl + '/#detail-view-post/' + data.id + '" target="_blank">' + data.title + '</a>' + description + '</li>';
				that.notification.prepend(notification);

			});

		},

		removeNotification: function(e){
			console.log('kdsksd');
			$(e.currentTarget).remove();
			this.countedNotifications(-1);

			if(this.currentNotifications === 0){
				this.notification.html('<li><span class="no_notifications">No new notifications!</span></li>');
				this.firstNotification = true;
			}

		},

		// helpers
		////////////////////////////////////////
		countedNotifications: function(count){
			if(count === 1){
				this.currentNotifications += 1;
			} else if(count === -1) {
				this.currentNotifications -= 1;
			}

			this.notificationCounter.show().html(this.currentNotifications);

			if(this.currentNotifications === 0){
				this.notificationCounter.hide();
			}

		},

		// helpers
		////////////////////////////////////////
		getData: function(){
			var templateItems = '';
			// this.notification.html('<li class="divider"></li>');
			// this.notification.append('<li><span class="notification_item_description">LAST NOFTIFICAIONS</span></li>');
			_.each(this.collection.models, function(value){
				console.log(value);
				// templateItems += _.template(ListItemTemplate, {attributes: value.attributes, frontendUrl: TheConfig.frontendUrl});
			});
		}
    });

    return View;
});