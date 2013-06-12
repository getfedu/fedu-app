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
	'../vendor/fedu/api',
	'../vendor/fedu/config',
	'moment'
], function( $, _, Backbone, TheCollection, TheModel, AddTemplate, ListTemplate, ListItemTemplate, EditTemplate, MessageTemplate, ModalTemplate, TheApi, TheConfig, Moment) {
	'use strict';

	var View = Backbone.View.extend({

		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		el: '#wrapper',
		inner: '#app',
		collection: {},
		messageTimeout: {},
		engine: {
			//Workaround for using underscore templating engine at typeahead
			compile: function(template) {
				var compiled = _.template(template);
				return {
					render: function(context) {
						return compiled(context);
					}
				};
			}
		},

		// delegated events
		events: {
			'submit form#add_post': 'savePost',
			'click button.delete_post': 'deleteModal',
			'click button.delete_post_confirmed': 'deletePost',
			'click button.edit_post': 'editPost',
			'submit form#edit_post': 'updatePost',
			'click button.cancel_post': function(){ Backbone.history.navigate('/list-posts', true); },
			'change #edit_post :input': 'changedHandler',
			'keydown :input.typeahead': 'autoCompleteKeyHandler',
			'focus :input.typeahead': function(e) { if(!$(e.currentTarget).hasClass('tt-query')){ this.initAutoComplete(); }},
			'click .tag': function(e){ this.removeTag($(e.currentTarget)); },
			'typeahead:autocompleted': function(e){ this.addTag(e.target, e.target.value); },
			'typeahead:selected': function(e){ console.log(e); this.addTag(e.target, e.target.value); },
			'click #edit_post .additional_wrapper_item .remove': 'removeAdditionalWrapperItem',
			'input #video_id': 'getIdsFromUrl'
		},

		initialize: function(){
			this.collection = new TheCollection();
			this.collection.on('postsFetched', this.getData, this );
			TheApi.on('apiDataFetched', this.setApiData, this );
		},

		// Re-rendering the App just means refreshing the statistics -- the rest
		// of the app doesn't change.
		render: function(target, value){
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

			var tagsArray = [];
			_.each(model.attributes.tags, function(value){
				tagsArray.push(value.tagName);
			});
			model.attributes.tags = tagsArray;

			this.render(this.inner, _.template(EditTemplate, { attributes: model.attributes, cid: model.cid }));
			Backbone.history.navigate('/edit-post', false);

			var string = $('.tags [type=hidden]').val();
			if(string){
				$('.tags [type=hidden]').val(string + ',');
			}
			if(string !== ''){
				var tags = string.split(',');
				_.each(tags, function(value){
					$('.tags [type=text]').before('<div class="btn tag">' + value + '</div>');
				});
			}
		},

		removeAdditionalWrapperItem: function(e){
			$(e.currentTarget).parent().remove();
		},

		// helpers
		////////////////////////////////////////

		savePost: function(e){
			e.preventDefault();

			if($('#video_id_hidden').val() === ''){
                this.render('#message', _.template(MessageTemplate, { message: 'Sorry, this video is either already in our database, or the url is not valid, please try again...', type: 'warning'}));
				return;
			}

			var model = new TheModel();
			var array = $('form').serializeArray();
			var data = {
				publishDate: new Moment().format(),
				updateDate: new Moment().format()
			};
			if(TheApi.theData){
				data.foreign = TheApi.theData.foreign;
			}
			_.each(array, function(value){
				if(value.name === 'tags'){
					var array = value.value.split(',');
					array.pop();
					data[value.name] = array;
				} else {
					data[value.name] = value.value;
				}
			});

			model.set(data);
			var that = this;
			model.save(null, {
                success: function(){
					Backbone.history.navigate('/list-posts', true);
                    that.render('#message', _.template(MessageTemplate, { message: 'saved', type: 'success'}));
                    clearTimeout(that.messageTimeout);
                    that.messageTimeout = setTimeout(function() {
						$('.alert').alert('close');
                    }, 5000);
                    TheApi.theData = {};
				},
                error: function(){
                    that.render('#message', _.template(MessageTemplate, { message: 'not saved! something went wrong.', type: 'error'}));
				}
			});
		},

		updatePost: function(e){
			e.preventDefault();
			var arrayPostData = $('.post_data :input.changed').serializeArray();
			var arrayPostAdditionalData = $('.post_additional_data').serializeArray();

			var data = {
				updateDate: new Moment().format()
			};

			_.each(arrayPostData, function(value){
				if(value.name === 'tags'){
					var array = value.value.split(',');
					array.pop();
					data[value.name] = array;
				} else {
					data[value.name] = value.value;
				}
			});

			data.additionalInfo = this.generateAdditionalDataObject(arrayPostAdditionalData);

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
				buttons: '<button class="btn" data-dismiss="modal">Cancel</button><button class="btn btn-danger delete_post_confirmed" data-dismiss="modal" data-id="' + id + '" aria-hidden="true">delete forever</button>'
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

		setApiData: function(){
			_.each(TheApi.theData, function(value, key){
				if(key === 'tags' && value){
					$('form#add_post .suggestions').append(value).show();
				} else {
					$('form#add_post :input[name="' + key + '"]').val(value).removeAttr('disabled');
					$('form#add_post :input.typeahead').removeAttr('disabled');
					$('form#add_post .tags').removeClass('disabled');
				}
			});
			$('#loader').fadeOut();
		},

		initAutoComplete: function(){
			var that = this;
			$('.typeahead').typeahead({
				name: 'autocomplete-tags',
				valueKey: 'tagName',
				prefetch: {
					url: TheConfig.nodeUrl + '/tag',
					ttl: 0
				},
				template: [
					'<p class="repo-name"><%= tagName %></p>',
					'<p class="repo-description"><%= description %></p>',
				].join(''),
				engine: that.engine
			});
			$('.typeahead').focus();
		},

		autoCompleteKeyHandler: function(e){
			if(e.keyCode === 188 && e.currentTarget.value !== ''){
				e.preventDefault();
				this.addTag(e.currentTarget, e.currentTarget.value);
			} else if(e.keyCode === 8 && e.currentTarget.value === '') {
				e.preventDefault();
				this.removeTag($(e.currentTarget).parents('.tags').children('.tag').last(), 'backspace');
			}
		},

		addTag: function(target, value){
			var countTags = $(target).parents('.uneditable-input');
			countTags = $(countTags).find('.btn').length+1;
			if(countTags !== 6){
				var val = $(target).parent().siblings('[type=hidden]').val();
				$(target).parent().siblings('[type=hidden]').val(value.trim().toLowerCase() + ',' + val).addClass('changed');
				$(target).val('').parent().before('<div class="btn tag">' + value.toLowerCase() + '</div>');
				$(target).typeahead('destroy');
				$('.typeahead').focus();
			}

			if(countTags === 5){
				$(target).attr('placeholder', 'only 5 tags allowed');
				$(target).attr('disabled', 'disabled');
			}

		},

		removeTag: function(target, type){
			var countTags = $(target).parent('.uneditable-input');
			countTags = $(countTags).find('.btn').length;
			var value = target.text();
			var valueList = target.siblings('[type=hidden]').val();
			if(valueList){
				valueList = valueList.replace(value + ',', '');
			}
			target.siblings('[type=hidden]').val(valueList).addClass('changed');
			if(type){
				$('.typeahead').val(value);
			}

			if(countTags === 5){
				var inputField = $(target).siblings('.twitter-typeahead').find('.tt-query');
				inputField.attr('placeholder', 'enter some tags');
				inputField.removeAttr('disabled');
			}

			target.remove();

		},

		generateAdditionalDataObject: function(data){
			var additionalInfo = [];
			var counter = 0;

			_.each(data, function(value){
				if(value.name === 'pullRequestTitle'){
					additionalInfo[counter] = {
						pullRequestTitle: value.value,
						pullRequestUrl: '',
						pullRequestPublishDate: new Moment().format()
					};
				} else if(value.name === 'pullRequestUrl'){
					additionalInfo[counter].pullRequestUrl = value.value;
					counter++;
				}
			});

			return additionalInfo;
		},

		getIdsFromUrl: function(e){
			$('#loader').fadeIn();
			var url = e.target.value;
		    var theId = '';
		    var type = '';

		    // regex from: http://stackoverflow.com/questions/5830387/how-to-find-all-youtube-video-ids-in-a-string-using-a-regex/5831191#5831191
		    var youtubeRegex = /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube\.com\S*[^\w\-\s])([\w\-]{11})(?=[^\w\-]|$)(?![?=&+%\w]*(?:['"][^<>]*>|<\/a>))[?=&+%\w-]*/ig;

		    // regex from: http://stackoverflow.com/questions/13286785/match-vimeo-video-id/13286930#13286930
		    var vimeoRegex = /https?:\/\/(?:www\.)?vimeo.com\/(?:channels\/|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/;

		    if(youtubeRegex.test(url)){
		        url.replace(youtubeRegex, '$1');
		        var exec = youtubeRegex.exec(url); //second time matching, to ensure urls like: https://www.youtube.com/watch?v=kiUnJ1d8vvw&feature=youtu.be work
		        theId = exec[1];
		        type = 'youtube';
		        $('#video_id_hidden').val(theId);
		        $('#videoType').val(type);
		        $('.alert').alert('close');
		        this.checkVideoId(theId, type);
		    } else if(vimeoRegex.test(url)){
		        var match = url.match(vimeoRegex);
		        theId = match[3];
		        type = 'vimeo';
		        $('#video_id_hidden').val(theId);
		        $('#videoType').val(type);
		        $('.alert').alert('close');
		        this.checkVideoId(theId, type);
		    } else {
                $('#loader').hide();
                $('#video_id_hidden').val('');
                $('form#add_post :input[name="title"]').val('').attr('disabled', 'disabled');
                $('form#add_post :input[name="description"]').val('').attr('disabled', 'disabled');
                $('form#add_post :input.typeahead').attr('disabled', 'disabled');
                $('form#add_post .tags').addClass('disabled');
                $('form#add_post .suggestions').hide();
		        theId = false;
                this.render('#message', _.template(MessageTemplate, { message: 'Sorry, this is no valid url...', type: 'warning'}));
                clearTimeout(this.messageTimeout);
                this.messageTimeout = setTimeout(function() {
					$('.alert').alert('close');
                }, 5000);
		    }
		},

		checkVideoId: function(id, type){
			var that = this;
			$.ajax({
				type: 'GET',
				url: TheConfig.nodeUrl + '/post-exists/' + id,
			}).done(function(res){
				if(res){
					$('#loader').hide();
	                that.render('#message', _.template(MessageTemplate, { message: 'Sorry, this video already is in our database...', type: 'warning'}));
	                clearTimeout(that.messageTimeout);
	                that.messageTimeout = setTimeout(function() {
						$('.alert').alert('close');
	                }, 5000);
	                $('#video_id_hidden').val('');
				} else {
	                TheApi.getData(id, type);
				}
			}).fail(function(error){
				console.log(error);
			});
		}
	});

	return View;
});