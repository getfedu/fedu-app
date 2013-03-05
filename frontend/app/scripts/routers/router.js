define([
	'jquery',
	'backbone',
	'../views/app'
], function($, Backbone, AppView) {
	'use strict';

	var appView = new AppView();

	var Router = Backbone.Router.extend({
		routes:{
			'foobar' : 'foobar', // #foobar
			'*actions': 'defaultAction'
		},

		foobar : function(){
			console.log('foobar');
		},

		defaultAction: function() {
			console.log('routing point - defaultAction');
			appView.render();
		}

	});

	return Router;
});