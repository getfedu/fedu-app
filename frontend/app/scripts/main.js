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
		}
	},
	paths: {
		jquery: '../components/jquery/jquery',
		underscore: '../components/underscore/underscore',
		backbone: '../components/backbone/backbone',
		text: '../components/requirejs-text/text',
		bootstrapDropdown: '../components/sass-bootstrap/js/bootstrap-dropdown'
	}
});

require([
	'routers/router',
	'jquery'
], function(Router, $, bootstrapDropdown) {
	'use strict';
	// initialize routing and start Backbone.history()
	new Router();
	Backbone.history.start();
	console.log('Running jQuery %s', $().jquery);
});
