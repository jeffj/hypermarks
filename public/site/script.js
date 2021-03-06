'use strict';






$( document ).ready(function() {
  ready()
  $("abbr.timeago").timeago();
});

var ready=function(){

  /* global airwaves, $, presentational, page_vars */

  var deleteListModal, deleteList, flash, modal, results, hypermark, header, sidebar, authModal, bookmarkletModal, newListModal, modalOverlay, addLinkModal, flash;

  //CHANNELS
  var modesChan = new airwaves.Channel();

  //special Glaobla link
  $(".public-link").on("click", function(){ event.preventDefault(); window.location.href=$(this).data('href') });


  $('.copy-list').on('click', function(){
    if (page_vars.username===null){
      window.location.href="/_auth/login"
      return
    }
      
   modesChan.broadcast('new-list');
  $('input','#new-list-modal').val($(this).data('list'));
  $('.js-submit','#new-list-modal').click();
  })


  //MIXINS
  modal = function ($el, channel, name) {

    channel.subscribe(name, function () {
      $el.addClass('-active');
    });

    channel.subscribe('exit', function () {
      $el.removeClass('-active');
    });

    $el.on('click', function () {
      channel.broadcast('exit');
    });

    $el.on('click', '.modal-window', function (e) {
      e.stopPropagation();
    });
    
    $el.on('click', '.js-close', function () {
      channel.broadcast('exit');
    });

    channel.subscribe('exit', function () {
      $el.removeClass('-active');
    });
  };



  //AREAS
  results = function ($el) {
    $el.on('click', '.js-add-to-list', function () {
      var $hypermark = $(this).parents('.hypermark'),
        bookmark_id = $hypermark.attr('data-_id'),
        address_id = $hypermark.attr('data-address_id');
      $(this).addClass('-active');
      $hypermark.addClass('top');
      modesChan.broadcast('add-to-list', bookmark_id, address_id);
    });

    $el.on('click', '.js-add-link', function () {
      modesChan.broadcast('add-link');
      setTimeout( function(){ $('input[name=url]').focus() },100);
    });

    $el.on('click', '.js-delete-list', function () {
      modesChan.broadcast('delete-list');
    });

    //Subscriptions
    modesChan.subscribe('exit', function () {
      $el.find('.js-add-to-list').removeClass('-active');
      $el.find('.hypermark').removeClass('top');
    });

  };



  hypermark = function ($el) {
    var _id = $el.attr('data-_id');

    $el.on('click', '.js-delete', function () {
      $.post('/_api/hypermarks/remove', {
        _id: _id
      }, function () {
        window.location.reload();
      });
    });
  };

    //activate all dropdowns
    $('.js-dropdown').on('click', function () {
      $(this).toggleClass('-active');

      $(document).bind('click', unselect);

    });
    

    var unselect=function(){
        if ( $(event.target).parents('.js-dropdown').length===0 ){
          $('.js-dropdown').removeClass('-active');
          $(this).unbind();
        }
    };

  header = function ($el) {
    // $el.on('click', '.js-dropdown', function () {
    //   $(this).toggleClass('-active');
    // });

    $el.on('click', '.js-logout', function () {
      $.post('/_auth/logout',{logout:true}, function() {
        window.location.reload();
      });
    });

    $el.on('click', '.js-bookmarklet', function (e) {
      modesChan.broadcast('bookmarklet');
      e.preventDefault();
    });
  };



  sidebar = function ($el) {
    $el.on('click', '.js-new-list', function () {
      $('input','#new-list-modal').val('');
      modesChan.broadcast('new-list');
      setTimeout( function(){ $('input[name=block]').focus() },100);

    });

    //Subscriptions
      
    modesChan.subscribe('add-to-list', function (bookmark_id, address_id) {
      $el.addClass('top');
      $el.find('.js-fave-lists').addClass('-hoverable');

      //add bookmark to block
      $el.on('click.temp', '.js-favorite-block a', function (e) {
        e.preventDefault();
        var block_id = $(this).data('block');
        $.post('/_api/hypermarks/clone', {
          bookmark_id: bookmark_id,
          address_id: address_id,
          block_id: block_id
        }, function () {
          window.location.reload();
        });
        modesChan.broadcast('exit');
      });
    });
      
    // dataChan.subscribe('favorite_lists', function (data) {
    //   var el = sidebarTmpl({
    //     favorite_blocks: data
    //   });
    //   $el.html($('*:first', el).unwrap());
    // });

    modesChan.subscribe('exit', function () {
      $el.off('.temp');
      $el.find('.js-fave-lists').removeClass('-hoverable');
    });
  };





  addLinkModal = function ($el) {
    modal($el, modesChan, 'add-link');
    var cb = function (e) {
      if (e.type === 'keypress' && e.keyCode !== 13) {
        return;
      } //bonk out the keypress is not enter;
        
      $.post('/_api/hypermarks/add', {
        url: $('input[name="url"]').val(),
        block: block
      }, function () {
        window.location.reload();
      });
      modesChan.broadcast('exit');
    };

    $('input', $el).on('keypress', cb);


    var block = page_vars.block ? page_vars.block : null;
    $el.on('click', '.js-add-link', cb);
  };





  newListModal = function ($el) {
    modal($el, modesChan, 'new-list');
    var list_name = $('#page-title').text(),
      cb = function (e) {
        var list_name = $('.js-name').val();
        if (e.type === 'keypress' && e.keyCode !== 13) {
          return;
        } //bonk out the keypress is not enter;

          
      $.post('/_api/favorites/add', {
          block_id: list_name
        }, function () {
          window.location.href='/'+page_vars.username+'/'+list_name
        });
        modesChan.broadcast('exit');
      };

    $el.on('click', '.js-add-current', function () {
      $('.js-name').val(list_name);
    });

    $el.on('click', '.js-submit', cb);
     
    $('input', $el).on('keypress', cb);
  };


  deleteList = function ($el) {
    modal($el, modesChan, 'new-list');
    var list_name = $('#page-title').text(),
      cb = function (e) {
        var list_name = $('.js-name').val();
        if (e.type === 'keypress' && e.keyCode !== 13) {
          return;
        } //bonk out the keypress is not enter;

          
      $.post('/_api/favorites/delete', {
          block_id: list_name
        }, function () {
        //  window.location.reload();
        });
        modesChan.broadcast('exit');
      };

    $el.on('click', '.js-add-current', function () {
      $('.js-name').val(list_name);
    });

    $el.on('click', '.js-submit', cb);
     
    $('input', $el).on('keypress', cb);
  };


  // $("#delete-list").on('click', function(){
  //     var list_name = $('#page-title').text();
  //     $.post('/_api/favorites/add', {
  //         block_id: "new"
  //       }, function () {
  //         window.location.reload();
  //       });




  // });

  deleteList=function($el){

  var cb = function (e) {

      $.post('/_api/favorites/delete', {
        block_id: page_vars.block
      }, function () {
        window.location.reload();
      });

    
    };
    $el.on('click', cb);

  }


  bookmarkletModal = function($el) {
    modal($el, modesChan, 'bookmarklet');
  };



  authModal = function($el) {
    modal($el, modesChan, 'auth');
  };

  deleteListModal= function($el){
    modal($el, modesChan, 'delete-list');
    var cb = function (e) {
      var list_name = page_vars.block;
      $.post('/_api/favorites/delete', {
        block_id: list_name
      }, 
      function () {
        window.location="/";
      });
      modesChan.broadcast('exit');
    };

    $el.on('click', '.js-add-current', function () {
      $('.js-name').val(list_name);
    });

    $el.on('click', '.js-submit', cb);


  };

  modalOverlay = function ($el) {
    $el.on('click', function () {
      modesChan.broadcast('exit');
    });

    modal($el, modesChan, 'new-list, add-to-list, add-link');
  };



  flash = function ($this, flashClass, time) {
    if (!$this.hasClass(flashClass)) {
    $this.addClass(flashClass);
    setTimeout( function(){
      $this.removeClass(flashClass);
    }, time);
    }
  };


  deleteListModal($('#delete-list-modal'));
  modalOverlay($('#modal-overlay'));
  newListModal($('#new-list-modal'));
  addLinkModal($('#add-link-modal'));
  authModal($('#auth-modal'));
  bookmarkletModal($('#bookmarklet-modal'));
  sidebar($('#sidebar'));
  results($('#results'));
  header($('#header'));
  hypermark($('.hypermark'));
  //deleteList($('#delete-list'));

}
