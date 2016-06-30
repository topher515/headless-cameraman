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
  , width = args[6] // 600 how big should the screenshot be? (NOT IMPLEMENTED)
  , filepath = args[7]
  ;

var page = webpage.create();

// DO NOT CHANGE USERAGENT!
// We ned to specially set the useragent to get Google Webfonts to send
// us the appropriate font set 
// See: https://github.com/ariya/phantomjs/issues/10592#issuecomment-19611343
page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.0; WOW64) AppleWebKit/535.7 (KHTML, like Gecko) Chrome/16.0.912.75 Safari/535.7';
// I think this is because we need truetype fonts rather than woff...
// but it might be *the opposite* of that. Lol.

page.viewportSize = { width: screenWidth, height: screenHeight };
if (size === 'page') {

  // page.clipRect = { top: 0, left: 0, width: screenWidth, height: 10000 };
  page.clipRect = { top: 0, left: 0, width: 'auto', height: 'auto' };
  console.log('Screenshot entire page');
} else {
  // Default to just rendering 'screen' unless 'page' is specified
  page.clipRect = { top: 0, left: 0, width: screenWidth, height: screenHeight };
  console.log('Screenshot page rect: ', page.clipRect);
}

console.log('Opening: ' + shotUrl);

page.onError = function (msg, trace) {
  // This is called when an *on page* error occurs in javascript
  // e.g., a in page JS exception
  console.error('On Page Error: ', msg);
  trace.forEach(function(item) {
      console.error('  ', item.file, ':', item.line);
  });
};


page.open(shotUrl, function(status) {

  if (status !== 'success') {
    console.log('Failed to load: ' + shotUrl);
    phantom.exit(1);
    // JS interpreter exited!
  }

  var pageHeight = page.evaluate(function() { // Executing in page sandbox
    
    // We need to tell the app-container to not show scroll bars
    $('.app-container').css({ overflow: 'hidden' });

    // Determine what the height of the page is
    var pageHeight = $('.section-wrapper').outerHeight();
    if (!pageHeight) {
      pageHeight = $('body').outerHeight()
    }
    return pageHeight;
  });

  if (size === 'page' && pageHeight) {
    // Change viewport to do fullscreen capture
    page.viewportSize = { width: screenWidth, height: pageHeight };
    page.clipRect = { top: 0, left: 0, width: screenWidth, height: pageHeight };

  } else {
    page.clipRect = { top: 0, left: 0, width: screenWidth, height: screenHeight };

  }

  if (delay) {
    console.log('Delaying render for ' + delay + ' ms.');
  }

  setTimeout(function() {
    page.render(filepath, { format:'png' });
    page.release();

    console.log('Rendered successfully to: ' + filepath);
    phantom.exit(0);

  }, delay);


});

