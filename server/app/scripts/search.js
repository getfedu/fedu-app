// Search
///////////////////////////////////////////////////////////

'use strict';

module.exports = function(app, collectionPosts, collectionTags){
    var search = {
        generateTitleObject: function(query){
            var titleObject = {};
            var titleArray = [];
            titleObject.$and = titleArray;
            if(query.query){
                var split = query.query.split(' ');
                for (var i = 0; i < split.length; i++) {
                    var obj = {};
                    obj.title = {};
                    obj.title.$regex = '^.*' + split[i] + '.*$';
                    obj.title.$options = 'i';
                    titleArray.push(obj);
                }
            }

            return titleObject;
        },

        generateDurationObject: function(query){
            var durationObject = {};
            if(query.duration){
                durationObject = {
                    'foreign.duration': {
                        '$gte': parseInt(query.duration, 10) - 300,
                        '$lte': parseInt(query.duration, 10) + 300
                    }
                };
            }

            return durationObject;
        },

        generateQuery: function(query){
            var titleObject = this.generateTitleObject(query);
            var durationObject = this.generateDurationObject(query);

            var queryObj = {};
            if(query.query && query.duration && !query.tag){
                queryObj = { $and: [durationObject, titleObject]};
            } else if(query.tag && query.duration && !query.query){
                queryObj =  { $and: [durationObject, { tags: query.tag }] };
            } else if(query.query && query.tag && query.duration){
                queryObj =  { $and: [durationObject, { tags: query.tag }, titleObject] };
            } else if(query.tag && query.query){
                queryObj =  { $and: [{ tags: query.tag }, titleObject] };
            } else if(query.query && !query.tag) {
                var queryString = query.query;
                queryObj = { $or: [{ tags: queryString.trim() }, titleObject] };
            } else if(query.tag && !query.query) {
                queryObj = { tags: query.tag };
            }
            return queryObj;
        }
    };

    // Search Posts in db
    app.get('/search', function(req, res) {

        var queryObj = search.generateQuery(req.query);
        var skip = parseInt(req.query.skip, 0);
        var top = parseInt(req.query.top, 0);
        var thePosts = [];
        var posts = collectionPosts.find(queryObj).skip(skip).limit(top).sort({ _id: -1}).stream();
        posts.on('data', function(item) {
            posts.pause(); // pause stream until data is manipulated
            collectionTags.find({ tagName: { $in: item.tags } }).toArray(function(err, tag_results){
                item.tags = tag_results;
                thePosts.push(item);
                posts.resume();
            });
        });

        posts.on('end', function(){
            res.json(thePosts);
        });
    });

    return search;
};