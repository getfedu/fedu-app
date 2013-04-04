define([
	'jquery',
	'socketIo',
	'vendor/fedu/config'
], function($, SocketIo, TheConfig) {
    'use strict';

    var websocket = {
		socket: null,
		notificationWrapper: $('.notification_wrapper'),
		notification: $('.notification_wrapper .notification'),

		init: function(){
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

			that.notification.text('');

			this.socket.on('notifyPost', function(data){
				that.notificationWrapper.fadeIn();
				description = (data.description !== '') ? '(' + data.description + ')' : '';
				notification = 'Post: <a href="' + TheConfig.frontendUrl + '/#detail-view-post/' + data.id + '" target="_blank">' + data.title + '</a> ' + description + '<br />';

				that.notification.html(notification);
				that.notificationWrapper.delay(8000).fadeOut();

			});

		}
    };

    return websocket;
});