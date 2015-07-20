import os
import json
import subprocess
from urlparse import urlparse
from urllib import unquote

from cherrypy import wsgiserver
from flask import Flask, request, send_file
app = Flask(__name__)

DEBUG_MODE = os.environ.get('DEBUG') in ('True','1')
PHANTOMJS_BIN = os.environ.get('PHANTOMJS_BIN', '/usr/bin/phantomjs')
PHANTOMJS_SCRIPT = os.environ.get('PHANTOMJS_SCRIPT', '/opt/render.js')
SCREENSHOT_FILE_PATH = '/tmp/rendered-page-image'

@app.route("/healthcheck", methods=['GET'])
def healthcheck():
    return "OK (hostname: %s)" % os.environ.get('HOSTNAME')

@app.route("/screenshot", methods=['GET'])
def screenshot():

    environ = { 
        'URL': unquote(request.args['url']),
        'SIZE': request.args.get('size','screen'),
        'DELAY': str(int(request.args.get('delay', 0)) * 1000),
        'SCREEN_WIDTH': str(int(request.args.get('screen_width', 915))),
        'SCREEN_HEIGHT': str(int(request.args.get('screen_height', 580))),
        'WIDTH': str(int(request.args.get('width', 600))),
        'SCREENSHOT_FILE_PATH':SCREENSHOT_FILE_PATH
    }
    subprocess.check_call([PHANTOMJS_BIN, PHANTOMJS_SCRIPT], env=environ)

    return send_file(SCREENSHOT_FILE_PATH, mimetype='image/png')


if __name__ == "__main__":
    host = "0.0.0.0"
    port = int(os.environ.get('LISTEN_PORT', 80))
    
    app.config['DEBUG'] = DEBUG_MODE
    # app.run(debug=True, host=host, port=port)

    d = wsgiserver.WSGIPathInfoDispatcher({'/': app})
    server = wsgiserver.CherryPyWSGIServer((host, port), d)

    try:
        print "Listening on %s:%s" % (host,port)
        server.start()
    except KeyboardInterrupt:
        server.stop()