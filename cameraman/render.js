// PHANTOM JS SCRIPT

var webpage = require('webpage');
var system = require('system');
var env = system.env;

var args = system.args;

console.log('Called with args', args);

if (args.length !== 8) {
  console.log('Missing arguments');
  phantom.exit(2);
}

var shotUrl = args[1] // url of page to screenshot
  , size = args[2] // screen or page
  , delay = args[3] // param is milliseconds
  , screenWidth = args[4]   // default 915
  , screenHeight = args[5]  // default 580
  , width = args[6] // 600
  , filepath = args[7]
  ;

var page = webpage.create();
page.settings.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) ' + 
                          'AppleWebKit/537.36 (KHTML, like Gecko) ' + 
                          'Chrome/43.0.2357.132 Safari/537.36';

page.viewportSize = { width: screenWidth, height: screenHeight };
if (size !== 'page') {
  // Default to just rendering 'screen' unless 'page' is specified
  page.clipRect = { top: 0, left: 0, width: screenWidth, height: screenHeight };
}

console.log('Opening: ' + shotUrl);

page.onError = function (msg, trace) {

  console.error('On Page Error: ', msg);
  trace.forEach(function(item) {
      console.error('  ', item.file, ':', item.line);
  });
};

page.open(shotUrl, function(status) {

  if (status !== 'success') {
    console.log('Failed to load: ' + shotUrl);
    phantom.exit(1);
  }

  console.log('Delaying render for ' + delay + ' ms.');

  setTimeout(function() {
    page.render(filepath, { format:'png' });
    page.release();

    console.log('Rendered successfully to: ' + filepath);
    phantom.exit(0);

  }, delay);

});

