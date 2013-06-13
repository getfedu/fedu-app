define([
	'jquery',
	'underscore',
	'backbone',
	'../collections/notifications',
	'../models/notifications',
	'socketIo',
	'json!../../settings.json',
	'moment',
	'text!../templates/notification_center/list_item_template.html',
	'text!../templates/notification_center/latest_list_item_template.html'
], function($, _, Backbone, TheCollection, TheModel, SocketIo, TheConfig, Moment, ListItemTemplate, LatestListItemTemplate) {
    'use strict';

    var View = Backbone.View.extend({
		el: '#wrapper',
		socket: null,
		notification: '',
		notificationCounter: '',
		oldNotifications: false,
		collection: {},

		// delegated events
		events: {
			'click .notifications .notification_item': 'readNotification',
		},

		initialize: function(){
			this.collection = new TheCollection();
			this.collection.server_api.filter = 'partial';
			this.collection.on('notificationsFetched', this.getData, this);
			this.collection.fetchData();

			this.getUncheckedNotificationsCounted();
			var that = this;
			this.socket = SocketIo.connect(TheConfig.websocketUrl);
			this.socket.on('connect', function(){
				that.notifyPost();
			});
		},

		notifyPost: function(){
			var that = this;
			var	description = '',
				publishDate = '',
				templateItems = '';

			// used for flagging and pull request
			this.socket.on('notify-post', function(data){
				that.countedNotifications(+1);
				that.notification.find('.no_notifications').remove();
				publishDate = new Moment(data.publishDate).format('H:m:s [ Uhr - ] DD.MM.YY');
				description = (data.description !== '') ? '<span class="description">' + data.description + '</span>' : '';
				templateItems = _.template(LatestListItemTemplate, {attributes: data, description: description, publishDate: publishDate, frontendUrl: TheConfig.frontendUrl, backendUrl: TheConfig.backendUrl});
				that.notification.prepend(templateItems);
			});
		},

		readNotification: function(e){
			var locateCurrentTarget = $(e.currentTarget);

			if(locateCurrentTarget.hasClass('latest')){
				locateCurrentTarget.removeClass('latest');
			}
		},

		// helpers
		////////////////////////////////////////
		countedNotifications: function(count){
			this.notificationCounter = $('#notification_counter');
			var currentNotifications = parseInt(this.notificationCounter.text(), 0);

			if(count === 1){
				currentNotifications = currentNotifications + 1;
			} else if(count === -1) {
				currentNotifications -= 1;
			} else {
				currentNotifications = count;
			}

			this.notificationCounter.show().html(currentNotifications);

			if(currentNotifications === 0){
				this.notificationCounter.hide();
			}
		},

		getData: function(){
			this.notification = $('#notifications');
			this.notificationCounter = $('#notification_counter');
			var that = this;
			var description = '',
				templateItems = '',
				publishDate = '';

			_.each(this.collection.models, function(value){
				that.oldNotifications = true;
				publishDate = new Moment(value.attributes.publishDate).format('H:m:s [ - ] DD.MM.YY');
				description = (value.attributes.description !== '') ? '<span class="description">' + value.attributes.description + '</span>' : '';
				templateItems += _.template(ListItemTemplate, {attributes: value.attributes, description: description, publishDate: publishDate, frontendUrl: TheConfig.frontendUrl, backendUrl: TheConfig.backendUrl});
			});
			this.notification.append(templateItems);

			if(!this.oldNotifications){
				this.notification.html('<li class="no_notifications"><span>No Notifications exists!</span></li>');
				this.oldNotifications = true;
			} else {
				this.notification.append('<li class="show_all"><a href="' + TheConfig.backendUrl + '/#list-notifications">List all Notifications</a></li>');
			}
		},

		getUncheckedNotificationsCounted: function(){
			var that = this;
			this.collection.server_api.filter = 'countUnchecked';
			this.collection.fetch({
                success: function(collection) {
					that.countedNotifications(collection.models[0].attributes.uncheckedNotifications);
                },
                error: function(){
                    console.log('error - no data was fetched');
                }
            });
		}
    });

    return View;
});