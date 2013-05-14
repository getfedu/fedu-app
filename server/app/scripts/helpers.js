// Helper Functions
///////////////////////////////////////////////////////////
'use strict';
var moment = require('moment');

module.exports = function(collectionTags){
    var helpers = {
        checkTags: {
            init: function(tags, increaseOrDecrease){ // true = increase, false = decrease
                collectionTags = collectionTags;
                this.loop(tags, increaseOrDecrease);
            },

            loop: function(tags, increaseOrDecrease){
                if(tags.length){
                    for (var i = 0; i < tags.length; i++){
                        this.queryTags(tags[i], increaseOrDecrease);
                    }
                }
            },

            queryTags: function(value, increaseOrDecrease){
                var that = this;
                collectionTags.findOne({tagName: value}, function(err, result){
                    if(result){
                        if(increaseOrDecrease) {
                            that.increaseCounter(result);
                        } else {
                            that.decreaseCounter(result);
                        }
                    } else {
                        that.addTag(value);
                    }
                });
            },

            increaseCounter: function(result){
                result.counter = result.counter + 1;
                collectionTags.update({'_id': result._id }, result);
            },

            decreaseCounter: function(result){
                result.counter = result.counter - 1;
                collectionTags.update({'_id': result._id }, result);
            },

            addTag: function(value){
                var tag = {
                    tagName: value,
                    description: '',
                    counter: 1,
                    createDate: moment().format(),
                    updateDate: moment().format()
                };
                collectionTags.insert(tag);
            }
        }
    };
    return helpers;
};