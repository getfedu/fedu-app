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
		}
	},
	paths: {
		jquery: '../components/jquery/jquery',
		underscore: '../components/underscore/underscore',
		backbone: '../components/backbone/backbone',
		backbonePaginator: '../components/backbone.paginator/lib/backbone.paginator',
		text: '../components/requirejs-text/text',
		bootstrapCollapse: '../components/sass-bootstrap/js/bootstrap-collapse'
	}
});

require([
	'routers/router',
	'jquery',
	'bootstrapCollapse',
], function(Router, $, BootstrapCollapse) {
	'use strict';

	new Router();
	Backbone.history.start();
	console.log('Running jQuery %s', $().jquery);
});