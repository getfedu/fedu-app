define([
	'jquery',
	'underscore',
	'backbone',
	'../models/posts',
	'../models/notifications',
	'text!../templates/pull_request/merge_template.html',
	'text!../templates/pull_request/list_item_template.html',
	'text!../templates/modal_template.html',
	'../vendor/fedu/config',
	'moment'
], function( $, _, Backbone, ThePostsModel, TheNotificationsModel, MergeTemplate, ListItemTemplate, MessageTemplate, TheConfig, Moment) {
	'use strict';

	var View = Backbone.View.extend({

		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		el: '#app-wrapper',
		inner: '#app',
		notificationCounter: $('.notification_wrapper .notification_counter'),
		notifications: $('.notification_wrapper .notifications'),
		currentNotifications: 0,
		postModel: {},
		notificationModel: {},

		// delegated events
		events: {
			'click .pull_requests_wrapper button.remove': 'removePullRequest',
			'click .pull_requests_wrapper button.merge': 'mergePullRequest',
		},

		initialize: function() {
		},

		// Re-rendering the App just means refreshing the statistics -- the rest
		// of the app doesn't change.
		render: function(target, value) {
			// render function
			$(target).html(value);
		},

		// actions
		////////////////////////////////////////
		detailPullRequest: function(id){
			this.getData(id);
		},

		mergePullRequest: function(e){
			e.preventDefault();
			var that = this;
			var locateElement = $(e.currentTarget);
			var postId = locateElement.attr('data-post-id');
			var pullRequestId = locateElement.attr('data-pull-request-id');
			var locateForm = locateElement.parents('#' + pullRequestId);
			var array = locateForm.serializeArray();
			var pullRequestTitle = array[0].value;
			var pullRequestUrl = array[1].value;

			var data = {
				updateDate: new Moment().format(),
				pullRequestTitle: pullRequestTitle,
				pullRequestUrl: pullRequestUrl,
				pullRequestId: pullRequestId
			};

			this.postModel = new ThePostsModel({_id: postId});
			this.postModel.set(data);
			this.postModel.save(null, {
                success: function(){
					locateElement.parents('.pull_request_item').html('<h5>Request:</h5>Request successfully merged!');
					that.notifications.find('.notification_item[data-id="' + pullRequestId + '"]').remove();
					that.currentNotifications = that.notificationCounter.text();
					that.countedNotifications(-1);
				},
                error: function(){
					that.render('#message', _.template(MessageTemplate, { message: 'not merged! something went wrong.', type: 'error'}));
                }
			});

		},

		removePullRequest: function(e){
			e.preventDefault();
			var that = this;
			var locateElement = $(e.currentTarget);
			var pullRequestId = locateElement.attr('data-pull-request-id');

			var data = {
				updateDate: new Moment().format(),
				checked: true
			};

			this.notificationModel = new TheNotificationsModel({_id: pullRequestId});
			this.notificationModel.set(data);
			this.notificationModel.save(null, {
                success: function(){
					locateElement.parents('.pull_request_item').html('<h5>Request:</h5>Request successfully removed!');
					that.notifications.find('.notification_item[data-id="' + pullRequestId + '"]').remove();
					that.currentNotifications = that.notificationCounter.text();
					that.countedNotifications(-1);

				},
                error: function(){
					that.render('#message', _.template(MessageTemplate, { message: 'not removed! something went wrong.', type: 'error'}));
                }
			});

		},

		// helpers
		////////////////////////////////////////

		countedNotifications: function(count){
			if(count === 1){
				this.currentNotifications += 1;
			} else if(count === -1) {
				this.currentNotifications -= 1;
			} else {
				this.currentNotifications = count;
			}

			this.notificationCounter.show().html(this.currentNotifications);

			if(this.currentNotifications === 0){
				this.notificationCounter.hide();
			}

		},

		getData: function(id){
			var that = this;
			var templateItems = '';


			this.postModel = new ThePostsModel({_id: id});
			this.postModel.fetch({
                success: function(data) {
					that.render(that.inner, _.template(MergeTemplate, {attributes: data.attributes[0]}));

					that.notificationModel = new TheNotificationsModel({_id: id});
					that.notificationModel.fetch({
						success: function(additionalData) {
							var itemExist = false,
								counter = 0;

							_.each(additionalData.attributes, function(value){
								if(value.type === 'pull-request') {
									itemExist = true;
									templateItems += _.template(ListItemTemplate, {attributes: value, frontendUrl: TheConfig.frontendUrl, counter: counter++});
								}
							});

							if(!itemExist){
								that.render($('.pull_requests_wrapper .pull_requests'), '<strong>Sorry</strong>, no new pull request exists!');
							} else {
								that.render($('.pull_requests_wrapper .pull_requests'), _.template(templateItems));
							}

						},
						error: function(){
						    console.log('error - no data was fetched');
						}
					});

                },
                error: function(){
                    console.log('error - no data was fetched');
                }
            });

		}

	});

	return View;
});