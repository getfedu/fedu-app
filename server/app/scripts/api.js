
// API Section - Backend
///////////////////////////////////////////////////////////

'use strict';
var moment = require('moment');
var request = require('request');
require('moment-isoduration');

module.exports = function(app, saltKey, collectionUser){
    var auth = require('./auth.js')(saltKey, collectionUser);
    app.post('/api-call', auth.isAuth, function(req, res){

        var optionsVideo = {};

        if(req.body.type === 'youtube'){
            optionsVideo.url = 'https://www.googleapis.com/youtube/v3/videos/?id=' + req.body.id + '&key=' + req.body.key + '&part=snippet,contentDetails,statistics,status';
        } else if(req.body.type === 'vimeo') {
            optionsVideo.url = 'https://vimeo.com/api/v2/video/' + req.body.id + '.json';
        } else {
            res.send(500);
        }

        var parsedData = {};

        request(optionsVideo, function (error, response, apiData) {
            apiData = JSON.parse(apiData);
            if (req.body.type === 'vimeo') {
                apiData = apiData[0];
                if(response.statusCode === 200) {
                    parsedData.title = apiData.title;
                    parsedData.description = apiData.description;
                    parsedData.tags = apiData.tags;
                    parsedData.foreign = {};
                    parsedData.foreign.embedUrl = 'https://player.vimeo.com/video/' + apiData.id;
                    parsedData.foreign.linkUrl = 'https://vimeo.com/' + apiData.id;
                    parsedData.foreign.uploadDate = moment(apiData.upload_date).format();
                    parsedData.foreign.duration = apiData.duration;
                    parsedData.foreign.thumbnail = {};
                    parsedData.foreign.thumbnail.small = apiData.thumbnail_small;
                    parsedData.foreign.thumbnail.medium = apiData.thumbnail_medium;
                    parsedData.foreign.thumbnail.large = apiData.thumbnail_large;
                    parsedData.foreign.channelId = apiData.user_id;
                    parsedData.foreign.channelName = apiData.user_name;
                    parsedData.foreign.likeCount = apiData.stats_number_of_likes;
                    parsedData.foreign.playCount = apiData.stats_number_of_plays;
                    parsedData.foreign.commentCount = apiData.stats_number_of_comments;
                    parsedData.foreign.caption = false;

                    res.send(parsedData);
                } else {
                    res.status(204);
                    res.send('no content');
                }

            } else if (req.body.type === 'youtube'){
                if(apiData.items.length > 0){
                    apiData = apiData.items[0];
                    parsedData.title = apiData.snippet.title;
                    parsedData.description = apiData.snippet.description;
                    parsedData.tags = '';
                    parsedData.foreign = {};
                    parsedData.foreign.embedUrl = 'https://www.youtube.com/embed/' + apiData.id;
                    parsedData.foreign.linkUrl = 'https://youtu.be/' + apiData.id;
                    parsedData.foreign.uploadDate = moment(apiData.snippet.publishedAt).format();
                    parsedData.foreign.duration = moment.duration.fromIsoduration(apiData.contentDetails.duration).asSeconds();
                    parsedData.foreign.thumbnail = {};
                    parsedData.foreign.thumbnail.small = apiData.snippet.thumbnails.default.url;
                    parsedData.foreign.thumbnail.medium = apiData.snippet.thumbnails.medium.url;
                    parsedData.foreign.thumbnail.large = apiData.snippet.thumbnails.high.url;
                    parsedData.foreign.channelId = apiData.snippet.channelId;
                    parsedData.foreign.channelName = apiData.snippet.channelTitle;
                    parsedData.foreign.likeCount = apiData.statistics.likeCount;
                    parsedData.foreign.playCount = apiData.statistics.viewCount;
                    parsedData.foreign.commentCount = apiData.statistics.commentCount;
                    parsedData.foreign.caption = apiData.contentDetails.caption;

                    res.send(parsedData);
                } else {
                    res.status(204);
                    res.send('no content');
                }
            }
        });
    });
};