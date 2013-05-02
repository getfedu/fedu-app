define([
	'jquery',
	'backbone',
	'../views/app',
	'../views/posts',
	'../vendor/fedu/options'
], function($, Backbone, AppView, PostsView, TheOption) {
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
			'favorites' : function(){ if(TheOption.isAuth()){ this.favorites(); } else { Backbone.history.navigate('', true); }},
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
			require(['views/login'], function(View) {
				View.loginSuccessView();
			});
		},

		loginErrorView: function(){
			require(['views/login'], function(View) {
				View.loginErrorView();
			});
		},

		favorites: function(){
			this.postsView.listFavorites();
		},

		defaultAction: function() {
			Backbone.history.navigate('/404');
			this.appView.errorDefault();
		},

	});

	return Router;
});