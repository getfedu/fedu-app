define([
	'jquery',
	'backbone',
	'../views/app',
	'../views/posts',
	'../views/login',
	'../vendor/fedu/options'
], function($, Backbone, AppView, PostsView, LoginView, TheOption) {
	'use strict';

	// ajax settings (sent cors cookies)
	$.ajaxSetup({ xhrFields: { withCredentials: true }, dataType: 'json'});

	var Router = Backbone.Router.extend({
		appView: new AppView(),
		postsView: new PostsView(),
		loginView: new LoginView(),

		routes: {
			'' : 'overViewPosts',
			'detail-view-post/:id' : 'detailViewPost',
			'search/:params' : 'searchAction',
			'login-success' : 'loginSuccessView',
			'login-error' : 'loginErrorView',
			'favorites' : function(){ if(TheOption.isAuth()){ this.favorites(); } else { Backbone.history.navigate('', true); }},
			'about': 'about',
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
			this.loginView.loginSuccessView();
		},

		loginErrorView: function(){
			this.loginView.loginErrorView();
		},

		favorites: function(){
			this.postsView.listFavorites();
		},

		about: function(){
			this.appView.about();
		},

		defaultAction: function() {
			Backbone.history.navigate('/404');
			this.appView.errorDefault();
		}

	});

	return Router;
});