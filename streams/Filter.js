var util    = require("util")
  , events  = require("events")
  , Stream  = require("stream");

var Filter = exports = module.exports = function()
{
    this.readable = true;
    this.writable = true;
    this.closed   = false;
    Stream.call(this);
};
util.inherits(Filter, Stream);

//Filter.prototype.setEncoding = function(encoding)
//{
//    ;
//};
//
//Filter.prototype.pause = function()
//{
//    /* no buffering */
//    this.writable = false;
//};
//
//Filter.prototype.resume = function()
//{
//    if (this.readable) {
//        this.writable = true;
//        this.emit("drain");
//    }
//};

Filter.prototype.filter = function(chunk, cb)
{
    console.log(chunk);
    cb(null, chunk);
};

Filter.prototype.write = function(chunk, encoding, fd)
{
    var self = this;

    if (encoding)
        chunk = chunk.toString(encoding);
    if (this.writable) {
        if (this.readable) {
            this.filter.call(this, chunk, function(err,filteredChunk) {
                if (err) return self.emit("error", err);
               self.emit("data", filteredChunk);
            });
        }
    }
    return this.writable;
};

Filter.prototype.end = function(chunk, encoding)
{
    if (chunk)
        this.write(chunk, encoding);
    this.emit("end");
    //this.readable = false;
    //this.writable = false;
};

//Filter.prototype.destroy = function()
//{
//    this.readable = false;
//    this.writable = false;
//    //clearBuffers(this.parser);
//    this.emit("close");
//};
//
//Filter.prototype.destroySoon = Filter.prototype.destroy;

//Filter.prototype.pipe = function(dst)
//{
//    var self = this;
//
//    this.on("data", function(chunk) {
//        var ready = dst.write(chunk);
//        if (ready === false) {
//            self.pause();
//            dst.once("drain", self.resume.bind(self));
//        }
//    });
//    this.on("end", function() {
//        dst.end();
//    });
//};
