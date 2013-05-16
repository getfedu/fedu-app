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
		el: '#wrapper',
		inner: '#app',
		collection: {},
		messageTimeout: {},
		types: ['technology', 'speaker', 'conference'],

		// delegated events
		events: {
			'submit form#add_tag': 'saveTag',
			'click button.edit_tag': 'editTag',
			'submit form#edit_tag': 'updateTag',
			'click button.cancel_tag': function(){ Backbone.history.navigate('/list-tags', true); }
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
			var type = '';
			for (var i = 0; i < this.types.length; i++) {
				type += '<option>' + this.types[i] + '</option>';
			}
			this.render(this.inner, _.template(AddTemplate, {type: type}));
		},

		listTags: function(){ // called from collections/video.js
			this.render(this.inner, _.template(ListTemplate));
			this.collection.fetchData();
		},

		editTag: function(e){
			var id = $(e.currentTarget).attr('data-id');
			var model = this.collection.get(id);

			var type = '';
			for (var i = 0; i < this.types.length; i++) {
				if(model.attributes.type === this.types[i]){
					type += '<option selected="selected">' + this.types[i] + '</option>';
				} else {
					type += '<option>' + this.types[i] + '</option>';
				}

			}

			this.render(this.inner, _.template(EditTemplate, { attributes: model.attributes, cid: model.cid, type: type }));
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
                    clearTimeout(that.messageTimeout);
                    that.messageTimeout = setTimeout(function() {
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

			var array = $(':input').serializeArray();
			var data = {
				updateDate: new Moment().format(),
				description: array[0].value,
				type: array[1].value
			};
			var that = this;
			var id = $(e.currentTarget).attr('data-id');
			var model = this.collection.get(id);
			model.set(data);
			model.save(null, {
                success: function(){
                    that.render('#message', _.template(MessageTemplate, { message: 'Data was updated', type: 'success'}));
                    clearTimeout(that.messageTimeout);
                    that.messageTimeout = setTimeout(function() {
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
		}
	});

	return View;
});