'use strict';

//Middleware
//var browserify = require('browserify-middleware');


// controllers
var users = require('../app/controllers/users')
  , api = require('../app/controllers/api.js')
  , pages = require('../app/controllers/pages.js')
  , auth = require('./middleware/auth')
  , mongoose = require('mongoose')
  , User = mongoose.model('User');



module.exports = function (app, passport) {

  // Order of routes matters!!!!

  //API
  app.post('/_api/hypermarksChrome', api.postHypermarkChrome);
  
  app.post('/_api/hypermarks/add', api.postHypermark);
  app.get('/_api/post', api.imagePost);

  app.post('/_api/hypermarks/remove', api.removeHypermark);
  app.post('/_api/hypermarks/clone', api.cloneToBlock);
  app.post('/_api/hypermarks/move', api.moveToBlock);

  app.post('/_api/favorites/add', api.touchFavoriteBlock);
  app.post('/_api/favorites/delete', api.deleteFavoriteBlock);

  //Eoin's reservation page depends on this
  app.post('/_api/users/reserve', api.reserveUsername);

  app.get('/_auth/login', users.loginpage);
  app.get('/_auth/signup', users.signuppage);
  app.post('/_auth/users', users.create);


  app.post('/_temp/demo', pages.tempDemo);



  //AUTH
  app.post('/_auth/logout', users.logout);

  app.post('/_auth/localauth',
    passport.authenticate('local', {
      failureRedirect: '/login',
      failureFlash: 'Invalid email or password.'
    }), users.session);

  app.get('/_auth/external-login', users.externalLogin);

  app.param('user',function(req, res, next, id){
    User.findOne({username:id}, function(err, result){
      if (err) return res.send("User Lookup Error");
      if (!result) return res.send("No User Match");
      next();
    });
  });

  //PAGES

  
  app.get('/', pages.feed);
  app.get('/popular', pages.front);


  //app.get('/_my/uncategorized',auth.requiresLogin, pages.uncategorized);
  app.get('/_search', pages.search);
  app.get('/public/:block', pages.publicBlock);

  app.get('/:user', pages.userlist);
  app.get('/:user/:block', pages.privateBlock);
};
