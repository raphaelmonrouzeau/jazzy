var util    = require("util")
  , fs      = require("fs")
  , zlib    = require("zlib")
  , Fetcher = require("./Base");

var GzippedFileFetcher = exports = module.exports = function()
{
    Fetcher.apply(this, arguments);
};
util.inherits(GzippedFileFetcher, Fetcher);

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

GzippedFileFetcher.prototype.open = function(path, params, cb)
{
    var self = this;

    params = params || {};
    if (arguments.length === 2) {
        cb = params;
    }
    if (typeof path === "object") {
        params = path;
        path = params.path;
        delete params.path;
    }
    
    try {
        var gzipped = this.$gzipped = fs.createReadStream(path, params);
    } catch (e) {
        cb(e);
        return this;
    }

    cb(null, gzipped.pipe(zlib.createGunzip()));

    return this;
};

GzippedFileFetcher.prototype.start = function()
{
    this.$gzipped.resume();
};

GzippedFileFetcher.prototype.setEncoding = function(encoding)
{
    this.encoding = encoding;
    return this;
};

GzippedFileFetcher.prototype.onData = function(chunk)
{
    if (this.encoding)
        chunk = chunk.toString(this.encoding);
    this.emit("data", chunk);
};
