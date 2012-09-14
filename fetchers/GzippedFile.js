var util    = require("util")
  , fs      = require("fs")
  , zlib    = require("zlib")
  , Fetcher = require("./Base");

var GzippedFileFetcher = exports = module.exports = function(path, params)
{
    Fetcher.call(this);
    params = params || {};

    if (typeof path === "object") {
        params = path;
        path = params.path;
        delete params.path;
    }

    var self = this;

    this.open(function() {
        var gzipped = self.$gzipped = fs.createReadStream(path, params)
            .on("error", function(err) { self.emit("error", err); });
        return gzipped.pipe(zlib.createGunzip());
    }, function(stream) {
        self.$gzipped.resume();
    });

    //var self = this
    //  , stream = this.$stream = fs.createReadStream(path, params)
    //  , pipe = this.$pipe = stream.pipe(zlib.createGunzip());

    //this.validate(stream, function(err) {
    //    //pipe.setEncoding("utf8");
    //    pipe.on("error", function(err) {
    //        self.emit("error", err);
    //    });
    //    pipe.on("data", function(chunk) {
    //        self.emit("data", chunk);
    //    });
    //    pipe.on("close", function(err) {
    //        self.emit("error", err);
    //    });
    //    pipe.on("end", function() {
    //        self.emit("end");
    //    });
    //});
    
    //console.log("streams:");
    //console.log(this.$stream);
    //console.log("streams:");
    //console.log(this.$pipe);

    //this.emit("begin");
    //stream.resume();
    //return this;
};
util.inherits(GzippedFileFetcher, Fetcher);

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

//GzippedFileFetcher.prototype.open = function(path, params)
//{
//};
//
//GzippedFileFetcher.prototype.pause = function()
//{
//    this.$stream.pause();
//};
//
//GzippedFileFetcher.prototype.resume = function()
//{
//    this.$stream.resume();
//};
