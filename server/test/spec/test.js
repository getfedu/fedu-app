'use strict';
define([
    'jquery',
    'underscore',
    'backbone'
], function( $, _, Backbone) {

    module('Testmodule');
    test('TESSSST', 1, function(){
        console.log($, _, Backbone);
        equal('test', 'test', 'HOOORAY, its');
    });
});
