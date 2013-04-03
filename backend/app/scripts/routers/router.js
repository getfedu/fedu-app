define([
	'jquery',
	'backbone',
    '../views/app',
	'../views/posts',
	'../views/tags',
], function($, Backbone, AppView, PostsView, TagsView) {
	'use strict';

	var Router = Backbone.Router.extend({
		appView: new AppView(),
		postsView: new PostsView(),
		tagsView: new TagsView(),
		routes:{
			'add-post' : 'addPost',
			'list-posts' : 'listPosts',
			'edit-post' : 'editPost',
			'add-tag' : 'addTag',
			'list-tags' : 'listTags',
			'edit-tag' : 'editTag',
			'*actions': 'defaultAction'
		},

		// Post

		addPost: function(){
            this.postsView.addPost();
		},

		listPosts: function(){
			this.postsView.listPosts();
		},

		editPost: function(){
			this.postsView.listPosts();
			Backbone.history.navigate('/list-posts', false);
		},

		// Tag

		addTag: function(){
			this.tagsView.addTag();
		},

		listTags: function(){
			this.tagsView.listTags();
		},

		editTag: function(){
			this.tagsView.listTags();
			Backbone.history.navigate('/list-tags', false);
		},

		defaultAction: function() {
			console.log('routing point - defaultAction');
			this.appView.render();
		}

	});

	return Router;
});