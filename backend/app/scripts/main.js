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
		bootstrapTypeahead: '../components/sass-bootstrap/js/bootstrap-typeahead',
		moment: '../components/moment/moment'
	}
});

require([
	'routers/router',
	'bootstrapAlert',
	'bootstrapTransition',
	'bootstrapTypeahead',
	'bootstrapModal'
], function(Router, BootstrapAlert, BootstrapTransition, BootstrapModal, bootstrapTypeahead) {
	'use strict';
	// initialize routing and start Backbone.history()
	new Router();
	Backbone.history.start();
});