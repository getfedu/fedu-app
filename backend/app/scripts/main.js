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
		moment: '../components/moment/moment',
		socketIo: '../components/socket.io-client/dist/socket.io'
	}
});

require([
	'routers/router',
	'bootstrapAlert',
	'bootstrapTransition',
	'bootstrapTypeahead',
	'bootstrapModal',
	'socketIo'
], function(Router, BootstrapAlert, BootstrapTransition, BootstrapModal, bootstrapTypeahead, SocketIo) {
	'use strict';


	var socket = io.connect('http://localhost:4321');

	socket.on("notification", function(data){
		console.log(data);
	});

	socket.on("anotherEvent", function(data){
		console.log(data);
	});
	socket.emit('anotherEvent', 'sfdsf');


	// initialize routing and start Backbone.history()
	new Router();
	Backbone.history.start();
});