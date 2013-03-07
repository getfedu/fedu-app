define([
	'jquery',
	'underscore',
	'backbone',
	'../collections/posts',
	'../models/posts',
	'text!../templates/posts/add_template.html',
	'text!../templates/posts/list_template.html',
	'text!../templates/posts/list_item_template.html',
	'text!../templates/posts/edit_template.html',
	'text!../templates/message_template.html',
	'text!../templates/modal_template.html',
], function( $, _, Backbone, TheCollection, TheModel, AddTemplate, ListTemplate, ListItemTemplate, EditTemplate, MessageTemplate, ModalTemplate ) {
	'use strict';

	var View = Backbone.View.extend({

		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		el: '#app-wrapper',
		inner: '#app',
		collection: {},
		model: {},

		// delegated events
		events: {
			'submit form#add_post': 'savePost',
			'click button.delete': 'deleteModal',
			'click button.delete_confirmed': 'deletePost',
			'click button.edit': 'editPost',
			'submit form#edit_post': 'updatePost',
			'click button.cancel': function(){ Backbone.history.navigate('/list-posts', true); },
			'change #edit_post :input': 'changedHandler',
			'click button.search_api': 'searchApi'
		},

		initialize: function() {
			this.model = new TheModel();
			this.collection = new TheCollection();
			this.collection.on('postsFetched', this.getData, this );

		},

		// Re-rendering the App just means refreshing the statistics -- the rest
		// of the app doesn't change.
		render: function(target, value) {
			// render function
			$(target).html(value);
		},

		// actions
		////////////////////////////////////////

		addPost: function(){
			this.render(this.inner, _.template(AddTemplate));
		},

		listPosts: function(){ // called from collections/video.js
			this.render(this.inner, _.template(ListTemplate));
			this.collection.fetchData();
		},

		editPost: function(e){
			var id = $(e.currentTarget).attr('data-id');
			var model = this.collection.get(id);
			this.render(this.inner, _.template(EditTemplate, { attributes: model.attributes, cid: model.cid }));
			Backbone.history.navigate('/edit-post', false);
		},

		// helpers
		////////////////////////////////////////

		savePost: function(e){
			e.preventDefault();
			var array = $('form').serializeArray();
			var data = {};
			_.each(array, function(value){
				data[value.name] = value.value;
			});
			this.model.set(data);

			var that = this;
			this.model.save(null, {
                success: function(){
					Backbone.history.navigate('/list-posts', true);
                    that.render('#message', _.template(MessageTemplate, { message: 'saved', type: 'success'}));
                    setTimeout(function() {
						$('.alert').alert('close');
                    }, 5000);
				},
                error: function(){
                    that.render('#message', _.template(MessageTemplate, { message: 'not saved! something went wrong.', type: 'error'}));
				}
			});
		},

		updatePost: function(e){
			e.preventDefault();

			var array = $(':input.changed').serializeArray();
			var data = {};
			_.each(array, function(value){
				data[value.name] = value.value;
			});

			var that = this;
			var id = $(e.currentTarget).attr('data-id');
			var model = this.collection.get(id);
			model.set(data);
			model.save(null, {
                success: function(){
                    that.render('#message', _.template(MessageTemplate, { message: 'Data was updated', type: 'success'}));
                    setTimeout(function() {
						$('.alert').alert('close');
                    }, 5000);
				},
                error: function(){
                    that.render('#message', _.template(MessageTemplate, { message: 'not updated! something went wrong.', type: 'error'}));
                }
			});
		},

		deletePost: function(e){
			var id = $(e.currentTarget).attr('data-id');
			var model = this.collection.get(id);
			var that = this;
			model.destroy({
				success: function() {
					that.getData();
				},
				error: function(){
					that.render('#message', _.template(MessageTemplate, { message: 'not deleted! something went wrong.', type: 'error'}));
				},
				wait: true
			});
		},

		deleteModal: function(e){
			var title = $(e.currentTarget).parents().siblings(':first').text();
			var id = $(e.currentTarget).attr('data-id');
			this.render('#modal', _.template(ModalTemplate, {
				title: 'Delete a Post',
				description: 'Do you really want to delete ' + title + '?',
				buttons: '<button class="btn" data-dismiss="modal">Cancel</button><button class="btn btn-danger delete_confirmed" data-dismiss="modal" data-id="' + id + '" aria-hidden="true">delete forever</button>'
			}));
			$('#the_modal').modal();
		},

		getData: function(){
			var templateItems = '';
			_.each(this.collection.models, function(value){
				templateItems += _.template(ListItemTemplate, {attributes: value.attributes, cid: value.cid});
			});
			this.render('#posts_list', templateItems);
		},

		changedHandler: function(e){
			var target = $(e.currentTarget);
			if(target.is(':checkbox')){
				$(e.currentTarget).toggleClass('changed');
			} else {
				$(e.currentTarget).addClass('changed');
			}
		},

		searchApi: function(e){
			console.log($(e.currentTarget).siblings('.video_url').val());
			$.ajax({
				type: 'GET',
				url: 'https://www.googleapis.com/youtube/v3/videos?id=f7AU2Ozu8eo&key=AIzaSyB4b8cdEoaJ_rlaKcBU5A3bg012b4id1xU&part=snippet,contentDetails,statistics,status',
			}).done(function( msg ) {
				console.log(msg);
			});
		}
	});

	return View;
});
