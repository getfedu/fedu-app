define([
	'jquery',
	'backbone',
    '../views/app',
	'../views/posts'
], function($, Backbone, AppView, PostsView) {
	'use strict';

    var appView = new AppView();
	var postsView = new PostsView();

	var Router = Backbone.Router.extend({
		routes:{
			'add-post' : 'addPost',
			'*actions': 'defaultAction'
		},

		addPost: function(){
            postsView.render();
		},

		defaultAction: function() {
			console.log('routing point - defaultAction');
			appView.render();
		}

	});

	return Router;
});