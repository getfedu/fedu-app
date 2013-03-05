/* global QUnit */
(function () {
	'use strict';
	QUnit.config.autostart = false;

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
			jquery: '../app/components/jquery/jquery',
			underscore: '../app/components/underscore/underscore',
			backbone: '../app/components/backbone/backbone',
			text: '../app/components/requirejs-text/text'
		}
	});

	var testModules = [
		'spec/test'
	];

	require(testModules, QUnit.start);
}());