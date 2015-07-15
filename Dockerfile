FROM haproxy:1.5.14

MAINTAINER wilcox@zoomforth.com

VOLUME /opt

ADD haproxy.cfg /usr/local/etc/haproxy/haproxy.cfg
ADD serve.js /opt/serve.js
