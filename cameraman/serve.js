var spawnSync = require('child_process').spawnSync;
var express = require('express');
var fs = require('fs');
var rmdir = require('fs');
var path = require('path');

var argv = require('minimist')(process.argv.slice(2));

var app = express();

var DEBUG_MODE = !!process.env.DEBUG;
var PHANTOMJS_BIN = process.env.PHANTOMJS_BIN || 'node_modules/phantomjs-prebuilt/bin/phantomjs';
var PHANTOMJS_SCRIPT = process.env.PHANTOMJS_SCRIPT || 'render.js';

var SCREENSHOT_SHARE_DIR = '/tmp/headless-cameraman/'


var PORT = argv.port || 3000;


var makeRandomStr = function(strLength) {
  var possible = 'abcdefghijklmnopqrstuvwxyz1234567890';
  var randChars = [];
  for (var i=0; i<strLength; i++){
    randChars.push(possible.charAt(Math.floor(Math.random() * possible.length)));
  }
  return randChars.join('');
};



app.get("/healthcheck", function(req, res) {
  res.send('OK (hostname: ' + process.env.HOSTNAME + ')');
});

app.get('/screenshot', function(req, res) {

 // environ = { 
 //        'URL': unquote(request.args['url']),
 //        'SIZE': request.args.get('size','page'),
 //        'DELAY': str(int(request.args.get('delay', 0)) * 1000),
 //        'SCREEN_WIDTH': str(int(request.args.get('screen_width', 915))),
 //        'SCREEN_HEIGHT': str(int(request.args.get('screen_height', 580))),
 //        'WIDTH': str(int(request.args.get('width', 600))),
 //        'SCREENSHOT_FILE_PATH':SCREENSHOT_FILE_PATH
 //    }

  var screenshotFilePath = path.join(SCREENSHOT_SHARE_DIR, makeRandomStr(10) + '.png');

  var args = [
    // SCRIPT
    PHANTOMJS_SCRIPT,
    // URL
    req.query.url,
    // SIZE
    req.query.size || 'page',
    // DELAY - param in seconds; output arg in ms
    (parseFloat(req.query.delay) || 0) * 1000,
    // SCREEN_WIDTH
    req.query.screen_width || 1200,
    // SCREEN_HEIGHT
    req.query.screen_height || 600,
    // WIDTH
    req.query.width || 600,
    // SCREENSHOT_FILE_PATH
    screenshotFilePath,
  ]



  var procOut = spawnSync(PHANTOMJS_BIN, args, { timeout: 15000 })


  var stdout = procOut.output.map(function(b) { return b ? b.toString() : null; });

  console.log('status_code: ', procOut.status);
  
  console.log('stdout');

  stdout.map(function(m) { console.log(m); })
  console.log('\n');
  console.log('stderr: ', procOut.stderr.toString());


  if (procOut.status === 0) {

    // res.status(200)
    //     .type('png')
    //     .sendFile(screenshotFilePath);
    res.type('png')
        .sendFile(screenshotFilePath);
        // .sendFile(path.join(__dirname, 'sample.jpg'));
    
    res.once('finish', function() {
      fs.unlink(screenshotFilePath);
    });


  } else {
    res.status(400).json({ 
      error: 'child_process_error',
      status: procOut.status,
      stdout: stdout.join('\n'),
      stderr: procOut.stderr.toString()
    });
    return;
  }

  // rm(screenshotFilePath);




  // setTimeout(function() {
  //   phantomProc.kill()

  // }, 4000);

});


// fs.rmdir(SCREENSHOT_SHARE_DIR);
// fs.mkdir(SCREENSHOT_SHARE_DIR);


app.listen(PORT, function () {
  console.log('Cameraman service listening on port ' + PORT);
});