define([
	'jquery',
	'backbone',
    '../views/app',
	'../views/video'
], function($, Backbone, AppView, VideoView) {
	'use strict';

    var appView = new AppView();
	var videoView = new VideoView();

	var Router = Backbone.Router.extend({
		routes:{
			'add-video' : 'addVideo',
			'*actions': 'defaultAction'
		},

		addVideo: function(){
            videoView.render();
		},

		defaultAction: function() {
			console.log('routing point - defaultAction');
			appView.render();
		}

	});

	return Router;
});