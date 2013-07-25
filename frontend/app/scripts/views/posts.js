define([
	'jquery',
	'underscore',
	'backbone',
	'../collections/posts',
	'../models/posts',
	'../vendor/fedu/options',
	'json!../../settings.json',
	'text!../templates/posts/video.html',
	'text!../templates/posts/grid_video_items.html',
	'text!../templates/posts/info_video_items.html',
	'text!../templates/posts/player_video_items.html',
	'text!../templates/posts/detail_video_content.html',
	'text!../templates/message_template.html',
	'text!../templates/posts/surprise_me.html',
	'moment'
], function( $, _, Backbone, TheCollection, TheModel, TheOption, TheConfig, VideoTemplate, GridVideoItemsTemplate, InfoVideoItemsTemplate,
	PlayerVideoItemsTemplate, DetailVideoContentTemplate, MessageTemplate, SurpriseMeTemplate, Moment) {
	'use strict';

	var View = Backbone.View.extend({

		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		el: '#app-wrapper',
		breadcrumb: '#breadcrumb',
		collection: {},
		viewType: 'info',
		oldScrollPositionTop: 0,
		delaySearch: 0,
		popularTags: '#popular_tags',
		surpriseMe: '#surprise_me',
		viewControlPanel: '#view_control_panel',
		messageTimeout: {},
		postId: '',
		clickedRating: false,
		overviewAlreadyLoaded: false,

		// delegated events
		events: {
			'click .type' : 'setViewType',
			'click .video_container.no_player' : 'addVideoIframe',
			'keyup form#search' : 'handleSearchEvents',
			'submit form#search' : 'handleSearchEvents',
			'click form#flag_post .flag_submit': 'flagPost',
			'click form#pull_request .pull_request_submit': 'pullRequest',
			'click #btn_pull_request': 'checkPullRequest',
			'click .search_hint': 'searchHints',
			'click .popover .icon-remove': function(e){ e.stopPropagation(); $('.icon-question-sign').popover('hide');},
			'click #favorite': function(e){ if($(e.currentTarget).find('i').hasClass('icon-bookmark-empty')){ this.addFavoritePost(e); } else { this.removeFavoritePost(e); }},
			'click form#surprise_me #submit': 'surpriseMeSearch',
			'click form#rate_post .rating_scale li': 'ratingScale',
			'mouseover form#rate_post .rating_scale li': 'ratingScale',
			'mouseleave form#rate_post .rating_scale': 'removeRatingScale',
			'click form#rate_post .rate_submit': 'rating',
			'click #btn_rating': 'checkRating',
			'click .favorites_view .img_overlay': 'removeFavorite'
		},

		initialize: function() {
			// render default template (form)
			this.collection = new TheCollection();
			// listen to scroll event
			var that = this;
		    $(window).scroll(function(){
				that.scrolling();
		    });
		    $('body').keydown(function(e){ that.keyDownHandler(e); });
		},

		// Re-rendering the App just means refreshing the statistics -- the rest
		// of the app doesn't change.
		render: function(target, value) {
			$(target).html(value);
		},

		listDefault: function(){
			this.collection.paginator_core.url = TheConfig.nodeUrl + '/post';
			this.render(this.breadcrumb, ''); //clean breadcrumb
			this.render(this.el, VideoTemplate);
			$('.type[data-type=' + this.viewType + ']').addClass('active'); // set type button active-state
			// set page start to 0
			this.renderPopularTags();
			this.renderSurpriseMe();
			if(this.overviewAlreadyLoaded){
				this.getPostsAgain();
			} else {
				this.getPosts();
				this.overviewAlreadyLoaded = true;
			}
		},

		listPosts: function(){
			var templateItems = '';
			var that = this;
			var favorites = false;

			if(this.collection.models.length){
				_.each(this.collection.models, function(value){

					if($.inArray(value.attributes._id, TheOption.favorites) !== -1 && Backbone.history.fragment === 'favorites'){
						favorites = true;
						that.viewType = 'info';
						$(that.viewControlPanel).hide();
					}

					value.attributes.foreign.uploadDate = new Moment(value.attributes.foreign.uploadDate).format('l');

					var tagsSpeakerArray = [];
					var tagsArray = [];
					_.each(value.attributes.tags, function(tags_value){
						if(tags_value.type === 'speaker'){
							tagsSpeakerArray.push(tags_value);
						} else {
							tagsArray.push(tags_value);
						}
					});
					value.attributes.tags = tagsArray.concat(tagsSpeakerArray);

					if(that.viewType === 'grid'){
						templateItems += _.template(GridVideoItemsTemplate, {attributes: value.attributes});
					} else if(that.viewType === 'player'){
						templateItems += _.template(PlayerVideoItemsTemplate, {attributes: value.attributes});
					} else if(that.viewType === 'info'){
						templateItems += _.template(InfoVideoItemsTemplate, {attributes: value.attributes, favorites: favorites});
					}
				});
			} else {
				templateItems = _.template('<li class="clearfix"><h3>SORRY, we found nothing in here...</h3><p>maybe try <a href="#search/%5Bjavascript%5D">[javascript]</a> for some awesome videos.</li>');
			}

			this.render('#all_videos', templateItems);
		},

		detailDefault: function(id){
			this.getPost(id);
		},

		listPost: function(results){
			var templateDetailView = '';

			var favorites = TheOption.favorites;
			var favoriteStar = '<i class="icon-bookmark-empty"></i>';
			if(favorites.indexOf(results[0]._id) !== -1){
				favoriteStar = '<i class="icon-bookmark"></i> unsave';
			} else {
				favoriteStar = '<i class="icon-bookmark-empty"></i> save for later';
			}

			var rating = TheOption.rating;
			var isRated = '';
			if(rating.indexOf(results[0]._id) !== -1){
				isRated = 'rated';
			}
			results[0].foreign.uploadDate = new Moment(results[0].foreign.uploadDate).format('l');
			results[0].publishDate = new Moment(results[0].publishDate).format('l');
			results[0].foreign.duration = new Moment.duration(parseInt(results[0].foreign.duration, 10), 'seconds').asMinutes();
			results[0].foreign.duration = results[0].foreign.duration.toFixed(0);
			results[0].description = this.replaceURLWithHTMLLinks(results[0].description);

			var tagsSpeakerArray = [];
			var tagsArray = [];
			_.each(results[0].tags, function(value){
				if(value.type === 'speaker'){
					tagsSpeakerArray.push(value);
				} else {
					tagsArray.push(value);
				}
			});
			results[0].tags = tagsArray.concat(tagsSpeakerArray);

			templateDetailView = _.template(DetailVideoContentTemplate, {attributes: results[0], iconStar: favoriteStar, isRated: isRated});

			//window.scroll(0); // small screens start now on top of detailpage
			this.render(this.breadcrumb, ''); //clean breadcrumb
			this.render(this.el, templateDetailView);
			this.postId = $('#post_id').attr('data-post-id');
		},

		search: function(result){

			if(!$('#all_videos').length){
				this.render(this.el, VideoTemplate);
				this.renderPopularTags();
				this.renderSurpriseMe();
			}

			var searchForm = $('form#search .search-query');
			if(searchForm.val() !== result){
				searchForm.val(result);
			}

			var query = this.searchQuery(result);

			this.collection.paginator_core.url = TheConfig.nodeUrl + '/search';
			this.collection.server_api.query = query.query;
			this.collection.server_api.tag = query.tag;
			this.collection.server_api.duration = query.duration;

			if(this.overviewAlreadyLoaded){
				this.getPostsAgain();
			} else {
				this.getPosts();
				this.overviewAlreadyLoaded = true;
			}
		},

		flagPost: function(e){
			e.preventDefault();

			if(!$(e.currentTarget).hasClass('disabled')){
				var locateFlagForm = $('form#flag_post');
				var locateModalBody = locateFlagForm.find('.modal-body');
				var array = locateFlagForm.serializeArray();
				var flagDescription = array[0].value;
				var flagId = this.postId;
				var flagTitle = array[1].value;

				$.ajax({
					type: 'POST',
					url: TheConfig.nodeUrl + '/flag-post',
					data: {
						type: 'flag',
						id: flagId,
						title: flagTitle,
						description: flagDescription
					}
				}).done(function() {
					locateModalBody.html('<p><b>Post was flagged.</b> Thank you!</p>');
					$(e.currentTarget).addClass('disabled');
				});
			}
		},

		pullRequest: function(e){
			e.preventDefault();

			if(!$(e.currentTarget).hasClass('disabled')){
				var locateFlagForm = $('form#pull_request');
				var locateModalBody = locateFlagForm.find('.modal-body');
				var array = locateFlagForm.serializeArray();
				var pullRequestTitle = array[0].value;
				var pullRequestUrl = array[1].value;
				var pullRequestPostId = this.postId;
				var pullRequestPostTitle = array[2].value;

				$.ajax({
					type: 'POST',
					url: TheConfig.nodeUrl + '/pull-request',
					data: {
						type: 'pull-request',
						id: pullRequestPostId,
						title: pullRequestPostTitle,
						description: 'New pull request',
						pullRequestUrl: pullRequestUrl,
						pullRequestTitle: pullRequestTitle
					}
				}).done(function() {
					locateModalBody.html('<p><b>Thank you!</b> We will check your additional content and merge it!</p>');
					$(e.currentTarget).addClass('disabled');
				});
			}
		},

		addFavoritePost: function(e){
			if(TheOption.isAuth()){
				var that = this;
				$.ajax({
					type: 'POST',
					data: {
						postId: this.postId
					},
					url: TheConfig.nodeUrl + '/post-add-favorite'
				}).done(function(){
					$(e.currentTarget).html('<i class="icon-bookmark"></i> unsave');
					TheOption.favorites.push(that.postId);
				}).fail(function(error){
					console.log(error.responseText);
				});
			} else {
				this.render('#message', _.template(MessageTemplate, { message: 'Sorry... To to favor this post you have to sign in.', type: 'error'}));
				clearTimeout(this.messageTimeout);
                this.messageTimeout = setTimeout(function() {
					$('.alert').alert('close');
                }, 5000);
			}
		},

		removeFavoritePost: function(e, removeFavoritId){
			var postId = '';
			if(removeFavoritId){ // postId from favorite overview
				postId = removeFavoritId;
			} else {
				postId = this.postId;
			}

			if(TheOption.isAuth()){
				$.ajax({
					type: 'POST',
					data: {
						postId: postId
					},
					url: TheConfig.nodeUrl + '/post-remove-favorite'
				}).done(function(){
					if(!removeFavoritId){
						$(e.currentTarget).html('<i class="icon-bookmark-empty"></i> save for later');
					}
					TheOption.favorites.pop(postId);
				}).fail(function(error){
					console.log(error.responseText);
				});
			}
		},

		listFavorites: function(){
			if(!$('#all_videos').length){
				this.render(this.el, VideoTemplate);
				this.renderPopularTags();
				this.renderSurpriseMe();
			}
			this.collection.paginator_core.url = TheConfig.nodeUrl + '/post-list-favorite';
			this.collection.goTo(0);
			this.getPosts();
			$('.search-query').val('');
			this.render(this.breadcrumb, '<a href="#">Home</a> &raquo; Saved For Later');
		},

		surpriseMeSearch: function(e){
			e.preventDefault();
			var locateFlagForm = $('form#surprise_me');
			var array = locateFlagForm.serializeArray();
			var minutes = array[0].value;
			var lesson = array[1].value;
			var searchUrl = '[' + lesson + '] d:' + minutes;

			Backbone.history.navigate('/search/' + encodeURI(searchUrl), true);
		},

		rating: function(e){
			e.preventDefault();

			if(!$(e.currentTarget).hasClass('disabled')){
				var that = this;
				var locateForm = $('form#rate_post');
				var array = locateForm.serializeArray();

				var quality = array[0].value;
				var comprehensibility = array[1].value;

				if(quality !== '0' && comprehensibility !== '0'){
					$.ajax({
						url: TheConfig.nodeUrl + '/post-rate',
						type: 'POST',
						data: {
							id: this.postId,
							quality: quality,
							comprehensibility: comprehensibility
						}
					}).done(function() {
						$(e.currentTarget).addClass('disabled');
						locateForm.find('.modal-body').html('<p><b>Your rating was sent!</b></p>');
						TheOption.rating.push(that.postId);
					});
				}
			}
		},

		removeFavorite: function(e){
			e.preventDefault();
			var clickedElement = $(e.currentTarget);
			this.removeFavoritePost(e, clickedElement.attr('data-id'));
			clickedElement.parents('.info_video_item').remove();
		},

		// helper functions
		////////////////////////////////////////

		getPosts: function(){
			var that = this;

			this.collection.fetch({
			    success: function(collection) {
					that.collection = collection;
					that.listPosts();
			    },
			    error: function(){
			        console.log('error - no data was fetched');
			    }
			});
		},

		getPostsAgain: function(){
			var that = this;

			this.collection.goTo(0, {
			    success: function(collection) {
					that.collection = collection;
					that.listPosts();
			    },
			    error: function(){
			        console.log('error - no data was fetched');
			    }
			});
		},

		setViewType: function(e) {
			$('.type').removeClass('active');
			$(e.currentTarget).addClass('active');
			this.viewType = $(e.currentTarget).attr('data-type');
			this.listPosts();
		},

		getPost: function(id){
			var model = new TheModel({_id: id});
			var that = this;
			model.fetch({
				success: function(model, response){
					that.listPost(response);
				}
			});
		},

		addVideoIframe: function(e){
			var videoUrl = $(e.currentTarget).attr('data-video');
			$(e.currentTarget).removeClass('no_player').append('<iframe src="' + videoUrl + '?portrait=0&byline=0&title=0&autoplay=1&color=00adef&showinfo=0&theme=light&autohide=0&fs=1&version=3&enablejsapi=1" frameborder="0" allowfullscreen></iframe>');
			$(e.currentTarget).find('iframe').fadeIn();
		},

		infiniteLoad: function(){
			var that = this;
			var newScrollPositionTop = $(window).scrollTop();

			// send request only if new data exists
			if(newScrollPositionTop !== this.oldScrollPositionTop){
				this.collection.nextPage({
					update: true, // add to collection
					remove: false,
					success: function(){
						that.listPosts();
						that.oldScrollPositionTop = newScrollPositionTop;
					}
				});
			}
		},

		scrolling: function(){
			var scrollPosition = $(window).scrollTop() + $(window).height();
			var documentHeight = $(document).height();
			if(scrollPosition === documentHeight){
				this.infiniteLoad();
			}
		},

		searchHints: function(){
			$('.icon-question-sign').popover({
				placement: 'bottom',
				html: true
			});
			$('.icon-question-sign').popover('show');
		},

		handleSearchEvents: function(e){
			var doNotTriggerKeys = [
				37, 38, 39, 40, //arrowkeys
				46 // delete
			];

			var results = $('form#search').serializeArray();
			var result = results[0].value;

			if(e.type === 'submit'){
				e.preventDefault();
				this.searchPrepare(result, true);
			} else if(doNotTriggerKeys.indexOf(e.keyCode) === -1){
				var that = this;
				clearTimeout(this.delaySearch);
				this.delaySearch = setTimeout(function() {
					that.searchPrepare(result, false);
				}, 1000);
			}
		},

		searchPrepare: function(result, submit){
			if(result.length === 0){
				Backbone.history.navigate('/', true);
				$('.search-query').focus();
			} else if(result.length >= 3){
				Backbone.history.navigate('/search/' + encodeURI(result), false);
				this.search(result);
			} else if(submit){
				Backbone.history.navigate('/search/' + encodeURI(result), false);
				this.search(result);
			}
		},

		searchQuery: function(query){
			var tag = '';
			var duration = '';
			var queryString = '';
			query.toLowerCase();
			var queryArray = query.split(' ');

			var tagRegexString = '(\\[)' + '((?:[\u0000-\u00FF]*))' + '(\\])';
			var durationRegexString = '((d:))'+ '((\\d+))';
			var unicodeAreaRegexString = '((?:[\u0000-\u00FF]*))';

			var tagRegex = new RegExp(tagRegexString, ['i']);
			var durationRegex = new RegExp(durationRegexString, ['i']);
			var unicodeAreaRegex = new RegExp(unicodeAreaRegexString, ['i']);

			for (var i = 0; i < queryArray.length; i++) {
				if(tagRegex.test(queryArray[i])){
					var tagRegexResult = tagRegex.exec(query);
					tag = tagRegexResult[2];
				} else if(durationRegex.test(queryArray[i])){
					var durationRegexResult = durationRegex.exec(query);
					duration = durationRegexResult[4] * 60;
				} else if(unicodeAreaRegex.test(queryArray[i])){
					queryString += queryArray[i] + ' ';
				}
			}

			return {query: queryString, tag: tag, duration: duration};
		},

		renderPopularTags: function(){
			var that = this;
			$.ajax({
				url: TheConfig.nodeUrl + '/popular-tags'
			}).done(function(tags){
				var string = '';
				_.each(tags, function(value){
					string += '<li><span class="label label-inverse tag"><a href="#search/' + encodeURI('[' + value.tagName + ']') + '">' + value.tagName + '</a></span></li>';
				});
				that.render(that.popularTags, string);
			}).fail(function(error){
				console.log(error.responseText);
			});
		},

		renderSurpriseMe: function(){
			var that = this;
			$.ajax({
				url: TheConfig.nodeUrl + '/surprise-tags'
			}).done(function(tags){
				var lessons = '';
				_.each(tags, function(value){
					lessons += '<option>' + value.tagName + '</option>';
				});

				var minutes = '';
				for (var i = 5; i <= 60; i+=5) {
					minutes += '<option>' + i + '</option>';
				}

				that.render(that.surpriseMe, _.template(SurpriseMeTemplate, {minutes: minutes, lessons: lessons}));
			}).fail(function(error){
				console.log(error.responseText);
			});
		},

		checkPullRequest: function(e){
			e.preventDefault();
			if(TheOption.isAuth()){
				$('#pull_request_modal').modal();
			} else {
				this.render('#message', _.template(MessageTemplate, { message: 'Sorry... To send pull requests you have to sign in.', type: 'error'}));
				clearTimeout(this.messageTimeout);
                this.messageTimeout = setTimeout(function() {
					$('.alert').alert('close');
                }, 5000);
            }
		},

		ratingScale: function(e){
			e.preventDefault();
			var clickedElement = $(e.currentTarget);
			var parent = clickedElement.parent();
			var children = parent.children();
			var index = clickedElement.index();
			parent.find('li').removeClass('icon-star hover rated').addClass('icon-star-empty');
			if(e.type === 'click'){
				parent.next().val(index+1);
				for(var i=0; i<=index; i++){
					children.eq(i).removeClass('icon-star-empty').addClass('icon-star rated');
				}
			} else {
				for(var j=0; j<=index; j++){
					children.eq(j).removeClass('icon-star-empty').addClass('icon-star hover');
				}
			}

		},

		removeRatingScale: function(e){
			e.preventDefault();
			var clickedElement = $(e.currentTarget);
			var countElements = clickedElement.next().val() - 1;
			clickedElement.find('li.hover').removeClass('icon-star hover').addClass('icon-star-empty');
			for(var i=0; i<=countElements; i++){
				clickedElement.children().eq(i).removeClass('icon-star-empty').addClass('icon-star rated');
			}
		},

		checkRating: function(e){
			if(TheOption.isAuth()){
				if($(e.currentTarget).hasClass('rated')){
					this.render('#message', _.template(MessageTemplate, { message: 'Sorry... You can rate a Post only once...', type: 'error'}));
					clearTimeout(this.messageTimeout);
	                this.messageTimeout = setTimeout(function() {
						$('.alert').alert('close');
	                }, 5000);
				} else {
					$('#rating_modal').modal();
				}
			} else {
				this.render('#message', _.template(MessageTemplate, { message: 'Sorry... To to rate this post you have to sign in.', type: 'error'}));
				clearTimeout(this.messageTimeout);
                this.messageTimeout = setTimeout(function() {
					$('.alert').alert('close');
                }, 5000);
            }
		},

		keyDownHandler: function(e){
			if(e.keyCode === 32 && e.target.tagName !== 'INPUT'){
				// for pausing the video @TODO load video per yt/vimeo api (not iframe only)
				// console.log(e);
				// e.preventDefault();
			}
		},

		// From Stackoverflow: http://stackoverflow.com/questions/37684
		replaceURLWithHTMLLinks: function(text){
		    var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
		    return text.replace(exp,'<a href="$1" target="_blank">$1</a>');
		}
	});

	return View;
});