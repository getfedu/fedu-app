// Require.js allows us to configure shortcut alias
require.config({
	// The shim config allows us to configure dependencies for
	// scripts that do not call define() to register a module
	shim: {
		backbone: {
			deps: [
				'underscore',
				'jquery'
			],
			exports: 'Backbone'
		},
		underscore: { // template
			exports: '_'
		},
		bootstrapAlert: {
			deps: [
				'jquery'
			]
		},
		bootstrapTransition: {
			deps: [
				'jquery'
			]
		},
		bootstrapModal: {
			deps: [
				'jquery'
			]
		},
		bootstrapTypeahead: {
			deps: [
				'jquery'
			]
		},
		bootstrapDropdown: {
			deps: [
				'jquery'
			]
		},
		backbonePaginator: {
			deps: [
				'backbone'
			]
		},
		jQueryCookie: {
			deps: [
				'jquery'
			]
		}
	},
	paths: {
		jquery: '../components/jquery/jquery',
		underscore: '../components/underscore/underscore',
		backbone: '../components/backbone/backbone',
		text: '../components/requirejs-text/text',
		bootstrapAlert: '../components/sass-bootstrap/js/bootstrap-alert',
		bootstrapTransition: '../components/sass-bootstrap/js/bootstrap-transition',
		bootstrapModal: '../components/sass-bootstrap/js/bootstrap-modal',
		bootstrapTypeahead: '../components/typeahead.js/dist/typeahead',
		moment: '../components/moment/moment',
		socketIo: '../components/socket.io-client/dist/socket.io',
		bootstrapDropdown: '../components/sass-bootstrap/js/bootstrap-dropdown',
		backbonePaginator: '../components/backbone.paginator/lib/backbone.paginator',
		jqueryCookie: '../components/jquery.cookie/jquery.cookie',
	}
});

require([
	'routers/router',
	'bootstrapAlert',
	'bootstrapTransition',
	'bootstrapTypeahead',
	'bootstrapModal',
	'views/notification_center',
	'bootstrapDropdown'
], function(Router, BootstrapAlert, BootstrapTransition, BootstrapModal, BootstrapTypeahead, NotificationCenter, BootstrapDropdown) {
	'use strict';

	// initialize routing, notifciation center and start Backbone.history()
	new NotificationCenter();
	new Router();
	Backbone.history.start();

});