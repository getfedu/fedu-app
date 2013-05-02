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
		bootstrapCollapse: {
			deps: [
				'jquery'
			]
		},
		bootstrapTooltip: {
			deps: [
				'jquery'
			]
		},
		bootstrapPopover: {
			deps: [
				'jquery',
				'bootstrapTooltip'
			]
		},
		backbonePaginator: {
			deps: [
				'backbone'
			]
		},
		bootstrapModal: {
			deps: [
				'jquery'
			]
		},
		bootstrapDropdown: {
			deps: [
				'jquery'
			]
		},
		bootstrapAlert: {
			deps: [
				'jquery'
			]
		},
		jqueryCookie: {
			deps: [
				'jquery'
			],
			exports: 'jQuery.cookie'
		}
	},
	paths: {
		jquery: '../components/jquery/jquery',
		underscore: '../components/underscore/underscore',
		backbone: '../components/backbone/backbone',
		backbonePaginator: '../components/backbone.paginator/lib/backbone.paginator',
		text: '../components/requirejs-text/text',
		bootstrapCollapse: '../components/sass-bootstrap/js/bootstrap-collapse',
		bootstrapTooltip: '../components/sass-bootstrap/js/bootstrap-tooltip',
		bootstrapPopover: '../components/sass-bootstrap/js/bootstrap-popover',
		bootstrapModal: '../components/sass-bootstrap/js/bootstrap-modal',
		bootstrapDropdown: '../components/sass-bootstrap/js/bootstrap-dropdown',
		bootstrapAlert: '../components/sass-bootstrap/js/bootstrap-alert',
		jqueryCookie: '../components/jquery.cookie/jquery.cookie'
	}
});

require([
	'routers/router',
	'jquery',
	'bootstrapCollapse',
	'bootstrapTooltip',
	'bootstrapPopover',
	'bootstrapModal',
	'bootstrapDropdown',
	'bootstrapAlert'
], function(Router, $, BootstrapCollapse, BootstrapTooltip, BootstrapPopover, BootstrapModal, BootstrapDropdown, BootstrapAlert) {
	'use strict';
	// ajax settings (sent cors cookies)
    $.ajaxSetup({ xhrFields: { withCredentials: true } });
	new Router();
	Backbone.history.start();
});