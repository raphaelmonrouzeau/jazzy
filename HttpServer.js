var http    = require('http');
var https   = require('https');
var fs      = require('fs');
var util    = require('util');
var jazutil = require('./util');

var defaults = {
    server: {
        http: {
            port: 80
        },
        https: {
            port: 443
        }
    }
};

function start(conf, router)
{
    jazutil.setObjectDefaults(conf, defaults);
    
    if (typeof conf.server.https.cert === 'string') {
        conf.server.https.cert = fs.readFileSync(conf.server.https.cert);
    }
    if (typeof conf.server.https.key === 'string') {
        conf.server.https.key = fs.readFileSync(conf.server.https.key);
    }

    if (typeof conf.server.http.port === 'string') {
        m = conf.server.http.port.match(/^env:(.*)$/)
        if (m) {
            conf.server.http.port = process.env[m[1]];
        }
    }

    http.createServer(router).listen(conf.server.http.port);
    console.log(JSON.stringify({ module: "server", name: "start", protocol: "http", port: conf.server.http.port }));

    if (typeof conf.server.https.cert !== 'undefined') {
        https.createServer(conf.server.https, router).listen(conf.server.https.port);
        console.log(JSON.stringify({ module: "server", name: "start", protocol: "https", port: conf.server.https.port }));
    }
}

exports.start = start;

var HttpServer = exports = module.exports = function(options)
{
    ;
};


