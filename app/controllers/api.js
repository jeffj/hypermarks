'use strict';

var createHypermark = require('./create-hypermark.js')
  , mongoose = require('mongoose')
  , Bookmark = mongoose.model('Bookmark')
  , Address = mongoose.model('Address')
  , User = mongoose.model('User')
;


exports.postHypermark = function (req, res) {
  if (!req.user) return res.end('401');
  var opts = {
      user_url: req.body.url
    , user_id: req.user._id
  };
  createHypermark(opts, function(err){
    if (err) {
      console.log(err);
      res.end('500');
    } else {
      res.end('200');
    }
  });
};


exports.getTimeline = function (req, res) {
  if (!req.user) return res.end('401');

  Bookmark.getTimeline(req.user._id, function (err, hypermarks) {
    if (err) return res.end('500');
    res.json('200', hypermarks);
  });
};


//This function will crash the app if sent garbage data. Need to handle errors better here.
exports.addToBlock = function (req, res) {
  if (!req.user) return res.end('401');

  console.log(req.body)

  var bookmark_id = req.body.bookmark_id;
  var block_id = req.body.block_id;

  console.log(block_id, bookmark_id)

  Bookmark.findById(bookmark_id, function (err, bookmark) {
    if (err) return console.log(err);

    Bookmark.clone(bookmark, {
      block: block_id
    }, function (err, bookmark) {
      if (err) return console.log(err);
      res.json('200', bookmark);
    });
  });

};


exports.getPrivateBlock = function (req, res) {
  if (!req.user) return res.end('401');

  Bookmark.getPrivateBlock(req.user._id, req.param('block'), function (err, hypermarks) {
    if (err) return console.log(err);
    res.json('200', hypermarks);
  });
};


exports.getPublicBlock = function (req, res) {
  Bookmark.getPublicBlock(req.param('block'), function (err, hypermarks) {
    if (err) return console.log(err);
    res.json('200', hypermarks);
  });
};


exports.searchHypermarks = function (req, res) {
  Address.search({
    query: req.query.q
  }, function (err, results) {
    if (err) return console.log(err);
    res.json('200', results);
  });
};


exports.touchFavoriteBlock = function (req, res) {
  if (!req.user) return res.end('401');

  User.touchFavoriteBlock(req.user._id, req.body.block, function (err, user) {
    if (err) return console.log(err);
    res.json('200', user);
  });
};

exports.getFavoriteBlocks = function (req, res) {
  if (!req.user) return res.end('401');

  res.json('200', req.user.getFavoriteBlocks());
};