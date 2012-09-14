var util    = require("util")
  , fs      = require("fs")
  , Fetcher = require("./Base");

/*
 * Alternatively you can open with ``params`` only if you provide path within it. 
 *
 * Params are the same than ``fs.createReadStream``:
 *
 * - flags: 'r'
 * - encoding: null,
 * - fd: null,
 * - mode: 0666,
 * - bufferSize: 64 * 1024
 *
 * Plus the following:
 *
 * - path: path of file.
 */

var FileFetcher = exports = module.exports = function(path, params)
{
    Fetcher.call(this);
    params = params || {};

    if (typeof path === "object") {
        params = path;
        path = params.path;
        delete params.path;
    }

    this.open(function() {
        return fs.createReadStream(path, params);
    }, function(stream) {
        stream.resume();
    });
};
util.inherits(FileFetcher, Fetcher);
