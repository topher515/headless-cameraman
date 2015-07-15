
var webserver = require('webserver')
  , webpage = require('webpage')
  , system = require('system')
  , fs = require('fs')
  , env = system.env
  , server = webserver.create()
  ;

var LISTEN_PORT = env.LISTEN_PORT || 80;


var service = server.listen(LISTEN_PORT, function(request, response) {

  function dieGracefully(err) {
    response.statusCode = 400;
    response.setEncoding('utf8');
    response.setHeader('Content-Type', 'application/json');
    response.write(JSON.stringify({ status:'failure', message:err }));
    response.closeGracefully();
  }

  console.log('Got request: ' + request.method + ': ' + request.url);
  console.log(JSON.stringify(request.headers));

  var index = request.url.indexOf('?')
    , path = request.url.slice(0,index)
    , querystring = request.url.slice(index)
    ;

  if (request.method !== 'GET') {
    response.statusCode = 403;
    response.write("Method not allowed");
    response.close();
    return;
  }

  if (path === '/healthcheck') {
    response.statusCode = 200;
    response.write("OK (hostname: " + env.HOSTNAME + ")");
    response.close();
    return;    
  }

  if (index === -1) {
    return dieGracefully("Missing query params");
  }

  // Ignore all requests except "GET /screenshot"
  if (path !== "/screenshot") {
    response.statusCode = 404;
    response.write("Not Found");
    response.close();
    return;
  }

  var getParameterByName = function(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(querystring);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  };


  var shotUrl = getParameterByName('url') // url of page to screenshot
  //, size = getParameterByName('size') // screen or page
    , delay = parseInt(getParameterByName('delay') || 0)// in milliseconds
    , screenWidth = parseInt(getParameterByName('screen_width') || 915)   // default 915
    , screenHeight = parseInt(getParameterByName('screen_height') || 580)  // default 580
    , width = parseInt(getParameterByName('width') || 600) // 600
    ;

  if (!shotUrl) {
    return dieGracefully("Empty URL parameter");
  }

  var page = webpage.create();
  var filepath = '/tmp/last-screenshot.png';

  page.settings.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.132 Safari/537.36';

  page.viewportSize = { width: screenWidth, height: screenHeight };
  // page.clipRect = { top: 0, left: 0, width: screenWidth, height: screenHeight };

  console.log('Opening ' + shotUrl);

  page.onError = function (msg, trace) {
      console.log(msg);
      trace.forEach(function(item) {
          console.log('  ', item.file, ':', item.line);
      });
  };

  page.open(shotUrl, function(status) {

    if (status !== 'success') {
      return dieGracefully("Unable to load. Status: " + status);
    }

    setTimeout(function() {
      page.render(filepath);
      page.release();

      var f = fs.open(filepath, 'rb');

      response.statusCode = 200;
      response.setHeader('Content-Type', 'image/png');
      response.setEncoding('binary');
      response.write(f.read());
      f.close();
      response.closeGracefully();  

    }, delay);

  });

});


console.log('Listening on port: ' + LISTEN_PORT);