define([
	'jquery',
	'underscore',
	'backbone',
	'../collections/collection',
	'text!../templates/nav_template.html',
	'text!../templates/detail_page_template.html',
], function( $, _, Backbone, TheCollection, NavTemplate, DetailPageTemplate) {
	'use strict';

	var AppView = Backbone.View.extend({

		// Instead of generating a new element, bind to the existing skeleton of
		// the App already present in the HTML.
		el: '#app-wrapper',
		nav: '#nav',
		collection: {},
		detailPageData: {
			video: 'http://www.youtube.com/embed/f7AU2Ozu8eo',
			headline: 'Headline',
			description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate',
			rating: { number: 4.5, stars: '<i class="icon-star"></i><i class="icon-star"></i><i class="icon-star"></i><i class="icon-star"></i><i class=" icon-star-half"></i>' },
			metaInfo: 'Metainfo',
			additionalInfo: 'additional info'
		},

		// compile template
		navTemplate: _.template(NavTemplate),

		// delegated events
		events: {
			'click .test' : 'exampleFunction'
		},

		initialize: function() {
			this.collection = new TheCollection();
			this.collection.fetchData(this);
		},

		// Re-rendering the App just means refreshing the statistics -- the rest
		// of the app doesn't change.
		render: function() {
			// render function

			$(this.nav).html(this.navTemplate);
			$(this.el).html(_.template(DetailPageTemplate, this.detailPageData));

		},

		// helper functions
		////////////////////////////////////////
		exampleFunction: function() {
		},

	});

	return AppView;
});
