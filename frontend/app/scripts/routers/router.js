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
			'show-videos' : 'showVideos', 
			'*actions': 'defaultAction'
		},

		showVideos : function(){
			console.log('show all videos');
		},

		defaultAction: function() {
			console.log('routing point - defaultAction');
			appView.render();
		}

	});

	return Router;
});