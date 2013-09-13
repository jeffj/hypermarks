'use strict';

/*!
 * Module dependencies.
 */

var express = require('express');
var mongoStore = require('connect-mongo')(express);
var browserify = require('browserify');

/*!
 * Expose
 */

module.exports = function(app, config, passport) {

  // views config
  app.set('views', config.root + '/app/views');
  app.set('view engine', 'jade');

  //Stylsheet render
  app.use(require('stylus').middleware(config.root + '/public'));

  //Serving static files
  app.use(express.static(config.root + '/public'));

  // bodyParser should be above methodOverride
  app.use(express.bodyParser());
  app.use(express.methodOverride());

  // cookieParser should be above session
  app.use(express.cookieParser());
  app.use(express.session({
    secret: 'lolasaurus'
    , store: new mongoStore({
      url: config.db,
      collection: 'sessions'
    })
  }));

  // Passport session
  app.use(passport.initialize());
  app.use(passport.session());

  // var bundle = browserify()
  //     .use(jadeify(__dirname + '/views'))
  //     .addEntry(__dirname + '/main.js')
  // ;
  // app.use(bundle);

  //CORS 
  //TODO: Refactor into middleware
  //TODO: Secure!
  app.all('/*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', req.header('Origin'));
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
  });

  // routes should be at the last
  app.use(app.router);

};
