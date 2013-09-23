'use strict';

var mongoose = require('mongoose')
  , Bookmark = mongoose.model('Bookmark')
  , Address = mongoose.model('Address')
;

exports.timeline = function (req, res) {
  if (!req.user) return res.end('401');

  Bookmark.getTimeline(req.user._id, function (err, hypermarks) {
    if (err) return next(err);

    var results = {};

    res.render('timeline', {
      user: req.user
      , favorite_blocks: req.user.getFavoriteBlocks()
      , results: hypermarks
    });
  });
};