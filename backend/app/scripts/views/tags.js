define([
	'jquery',
	'underscore',
	'backbone',
	'../collections/tags',
	'../models/tags',
	'text!../templates/tags/add_template.html',
	'text!../templates/tags/list_template.html',
	'text!../templates/tags/list_item_template.html',
	'text!../templates/tags/edit_template.html',
	'text!../templates/message_template.html',
	'text!../templates/modal_template.html',
	'moment'
], function( $, _, Backbone, TheCollection, TheModel, AddTemplate, ListTemplate, ListItemTemplate, EditTemplate, MessageTemplate, ModalTemplate, Moment ) {
	'use strict';

	var View = Backbone.View.extend({

		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		el: '#app-wrapper',
		inner: '#app',
		collection: {},

		// delegated events
		events: {
			'submit form#add_tag': 'saveTag',
			'click button.edit_tag': 'editTag',
			'submit form#edit_tag': 'updateTag',
			'click button.cancel_tag': function(){ Backbone.history.navigate('/list-tags', true); },
			'change #edit_tag :input': 'changedHandler'
		},

		initialize: function() {
			this.collection = new TheCollection();
			this.collection.on('tagsFetched', this.getData, this );
		},

		// Re-rendering the App just means refreshing the statistics -- the rest
		// of the app doesn't change.
		render: function(target, value) {
			// render function
			$(target).html(value);
		},

		// actions
		////////////////////////////////////////

		addTag: function(){
			this.render(this.inner, _.template(AddTemplate));
		},

		listTags: function(){ // called from collections/video.js
			this.render(this.inner, _.template(ListTemplate));
			this.collection.fetchData();
		},

		editTag: function(e){
			var id = $(e.currentTarget).attr('data-id');
			var model = this.collection.get(id);
			this.render(this.inner, _.template(EditTemplate, { attributes: model.attributes, cid: model.cid }));
			Backbone.history.navigate('/edit-tag', false);
		},

		// helpers
		////////////////////////////////////////

		saveTag: function(e){
			e.preventDefault();
			var model = new TheModel();
			var array = $('form').serializeArray();
			var data = {
				publishDate: new Moment().format(),
				updateDate: new Moment().format()
			};
			_.each(array, function(value){
				data[value.name] = value.value;
			});

			model.set(data);
			var that = this;
			model.save(null, {
                success: function(){
					Backbone.history.navigate('/list-tags', true);
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

		updateTag: function(e){
			e.preventDefault();

			var array = $(':input.changed').serializeArray();
			var data = {
				updateDate: new Moment().format()
			};
			_.each(array, function(value){
				if(value.name === 'tags'){
					var array = value.value.split(',');
					array.pop();
					data[value.name] = array;
				} else {
					data[value.name] = value.value;
				}
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

		getData: function(){
			var templateItems = '';
			_.each(this.collection.models, function(value){
				templateItems += _.template(ListItemTemplate, {attributes: value.attributes, cid: value.cid});
			});
			this.render('#tags_list', templateItems);
		},

		changedHandler: function(e){
			var target = $(e.currentTarget);
			if(target.is(':checkbox')){
				$(e.currentTarget).toggleClass('changed');
			} else {
				$(e.currentTarget).addClass('changed');
			}
		},

	});

	return View;
});