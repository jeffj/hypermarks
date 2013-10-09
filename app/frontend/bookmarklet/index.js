'use strict';
var $ = require('zepto-browserify').$
  , responseHandler = require('./responseHandlers.js')
  , config = require('../../../config/config')()
;

console.log('bookmarklet', config)

<<<<<<< Updated upstream
//Put our styles in head
$('head').append('<link rel="stylesheet" href="' + config.url + '/styles/bookmarklet.css">');

// Create the XHR object.
function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ('withCredentials' in xhr) {
    xhr.open(method, url, true);
    xhr.withCredentials = true;
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  } else {
    // CORS not supported.
    xhr = null;
=======
//Put our styles in head 
//** This needs to be depicated.  Zepto does not load on major sites.
//$('head').append('<link rel="stylesheet" href="' + config.url + '/styles/bookmarklet.css">');
 
// Make the actual CORS request.
function loadRequest() {
  var img = new Image(); 
  img.onload=function(){
    responseHandler.success()
>>>>>>> Stashed changes
  }
  return xhr;
}

// Make the actual CORS request.
function makeCorsRequest() {
  var url = config.url + '/_api/hypermarks';


  var xhr = createCORSRequest('POST', url);
  if (!xhr) {
    console.log('CORS not supported');
    return;
  }

  // Response handlers.
  xhr.onload = function() {
    var text = xhr.responseText;
    console.log('Response from CORS request to ' + url + ': ' + text);

    if (text === '200') {
      responseHandler.success();
    } else if (text === '401') {
      responseHandler.login();
    } else {
      responseHandler.error();
    }
  };

  xhr.onerror = function() {
    console.log('Woops, there was an error making the request.');
  };

  // xhr.send();
  xhr.send('url=' + window.location);
}

//Fire the request
makeCorsRequest();
