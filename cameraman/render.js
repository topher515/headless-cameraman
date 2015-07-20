var webpage = require('webpage')
  , system = require('system')
  , env = system.env
  ;


function getOrFail(name) {
  if (!env[name]) {
    console.log('Missing env variable: ' + name);
    phantom.exit(2);
  }
  return env[name];
}


var shotUrl = getOrFail('URL') // url of page to screenshot
//, size = getOrFail('size') // screen or page
  , delay = parseInt(getOrFail('DELAY')) // param is milliseconds
  , screenWidth = parseInt(getOrFail('SCREEN_WIDTH'))   // default 915
  , screenHeight = parseInt(getOrFail('SCREEN_HEIGHT'))  // default 580
  , width = parseInt(getOrFail('WIDTH')) // 600
  , filepath = getOrFail('SCREENSHOT_FILE_PATH')
  ;

var page = webpage.create();
page.settings.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) ' + 
                          'AppleWebKit/537.36 (KHTML, like Gecko) ' + 
                          'Chrome/43.0.2357.132 Safari/537.36';

page.viewportSize = { width: screenWidth, height: screenHeight };
// page.clipRect = { top: 0, left: 0, width: screenWidth, height: screenHeight };

console.log('Opening: ' + shotUrl);

page.onError = function (msg, trace) {
    console.log(msg);
    trace.forEach(function(item) {
        console.log('  ', item.file, ':', item.line);
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

