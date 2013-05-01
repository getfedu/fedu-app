define([
	'jquery',
	'backbone',
	'../views/app',
	'../views/posts'
], function($, Backbone, AppView, PostsView) {
	'use strict';

	var Router = Backbone.Router.extend({
		appView: new AppView(),
		postsView: new PostsView(),

		routes: {
			'' : 'overViewPosts',
			'detail-view-post/:id' : 'detailViewPost',
			'search/:params' : 'searchAction',
			'login-success' : 'loginSuccessView',
			'login-error' : 'loginErrorView',
			'*actions': 'defaultAction'
		},

		overViewPosts: function(){
			this.postsView.listDefault();
		},

		detailViewPost: function(id){
			this.postsView.detailDefault(id);
		},

		searchAction: function(params){
			this.postsView.search(decodeURI(params));
		},

		loginSuccessView: function(){
			require([
				'views/login'
			], function(View) {
				View.loginSuccessView();
			});
		},

		loginErrorView: function(){
			require([
				'views/login'
			], function(View) {
				View.loginErrorView();
			});
		},

		defaultAction: function() {
			Backbone.history.navigate('/404');
			this.appView.errorDefault();
		},

	});

	return Router;
});