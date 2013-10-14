'use strict';

var $ = require('../vendor/jquery.js')
  , airwaves = require('airwaves')
  , sortable = require('../vendor/html5sortable')
  , presentational = require('./presentational.js')
  , sidebarTmpl = require('../../views/includes/sidebar.jade')
;

$ = sortable($);

//CHANNELS
var modesChan = new airwaves.Channel()
  , dataChan = new airwaves.Channel()
;



function update (name, data) {
  $('[data-' + name + ']').text(data);
}

//MIXINS
function modal($el) {
  $el.on('click', function() {
    modesChan.broadcast('exit');
  });

  $el.on('click', '.modal-window', function(e){
    e.stopPropagation();
  });

  $el.on('click', '.js-close', function(){
    modesChan.broadcast('exit');
  });

  modesChan.subscribe('exit', function(){
    $el.removeClass('-active');
  });
}


//AREAS
exports.results = function ($el) {
  $el.on('click', '.js-add-to-list', function() {
    var $hypermark = $(this).parents('.hypermark')
      , bookmark_id = $hypermark.attr('data-_id')
    ;
    $(this).addClass('-active');
    $hypermark.addClass('top');
    modesChan.broadcast('add-to-list', bookmark_id);
  });

  $el.on('click', '.js-add-link', function() {
    modesChan.broadcast('add-link');
  });

  //Subscriptions
  modesChan.subscribe('exit', function() {
    $el.find('.js-add-to-list').removeClass('-active');
    $el.find('.hypermark').removeClass('top');
  });

};


exports.hypermark = function ($el) {
  var _id = $el.attr('data-_id');

  $el.on('click', '.js-delete', function() {
    $.post('/_api/hypermarksRemove', { _id: _id }, function () {
      window.location.reload();
    });
  });
};


exports.header = function ($el) {
  $el.on('click', '.js-dropdown', function(){
    $(this).toggleClass('-active');
  });
};


exports.sidebar = function ($el) {
  $el.on('click', '.js-new-list', function(){
    modesChan.broadcast('new-list');
  });

  //Attach sortable plugin
  $('.js-sortable').sortable().bind('sortupdate', function(){
    saveFavoriteBlocks($(this));
  });

  //Subscriptions
  modesChan.subscribe('add-to-list', function(bookmark_id){
    $el.addClass('top');
    $el.find('.js-fave-lists').addClass('-hoverable');

    $el.on('click.temp', '.js-favorite-block', function(e) {
      e.preventDefault();
      var block_id = $(this).find('*[data-block]').data('block')
        , $counter = $(this).find('.js-count')
        , count = $counter.text()
      ;

      $.post('/_api/blocks', { bookmark_id: bookmark_id, block_id: block_id });
      console.log(count);

      $counter.text(parseInt(count, 10) + 1);
      presentational.flash($(this), '-added', 1000);
      modesChan.broadcast('exit');
    });
  });

  dataChan.subscribe('favorite_lists', function (data) {
    var el = sidebarTmpl({
      favorite_blocks: data
    });
    $el.html($('*:first', el).unwrap());
  });
  
  modesChan.subscribe('exit', function() {
    $el.off('.temp');
    $el.find('.js-fave-lists').removeClass('-hoverable');
  });

  function saveFavoriteBlocks ($ul) {
    var favorite_blocks = $ul.children('li').map(function (index) {
      return {
          '_id': $(this).find('[data-block]').data('block')
        , 'sort_order': index
      };
    });
    $.post('/_api/favorites', {favorite_blocks: favorite_blocks});
  }
};


exports.addLinkModal = function($el) {
  modal($el);

  $el.on('click', '.js-add-link', function() {
    $.post('/_api/hypermarks', { url: $('input[name="url"]').val() }, function() {
      window.location.reload();
    });
    modesChan.broadcast('exit');
  });

  modesChan.subscribe('add-link', function() {
    $el.addClass('-active');
  });

  modesChan.subscribe('exit', function(){
    $el.removeClass('-active');
  });
};


exports.newListModal = function($el) {
  modal($el);
  var list_name = $('#page-title').text();
  $el.find('.js-add-current').text(list_name);

  $el.on('click', '.js-add-current', function(){
    var list_name = $('#page-title').text();
    $('.js-name').val(list_name);
  });

  $el.on('click', '.js-submit', function(){
    var list_name = $('.js-name').val();
    $.post('/_api/users/favorites', { block_id: list_name }, function(data) {
      dataChan.broadcast('favorite_lists', data);
    });
    modesChan.broadcast('exit');
  });

  modesChan.subscribe('new-list', function() {
    $el.addClass('-active');
  });

  modesChan.subscribe('exit', function(){
    $el.removeClass('-active');
  });
};


exports.modalOverlay = function($el) {
  $el.on('click', function() {
    modesChan.broadcast('exit');
  });
  
  modesChan.subscribe('new-list, add-to-list, add-link', function(){
    $el.addClass('-active');
  });

  modesChan.subscribe('exit', function(){
    $el.removeClass('-active');
  });
};