var util    = require("util")
  , Stream  = require("stream").Stream;

/** Opens the fetcher on given path, URL, whatever the params addresses. And
 * starts the fetch processus.
 */

var Fetcher = exports = module.exports = function()
{
    Stream.call(this);
};
util.inherits(Fetcher, Stream);

/** Checks response.
 *
 * If returns an error the stream will send it, cancelling the run.
 */

Fetcher.prototype.validate = function(stream, cb)
{
    cb(null);
};

Fetcher.prototype.wrap = function(factory)
{
    var self = this;

    return factory()
    .on("error", function(error) {
        self.onError.call(self, error);
    })
    .on("data", function(chunk) {
        self.onData.call(self, chunk);
    })
    .on("close", function(error) {
        self.onClose.call(this, error);
    })
    .on("drain", function() {
        self.onDrain.call(this);
    })
    .on("pipe", function(src) {
        self.onPipe.call(this, src);
    })
    .on("end", function() {
        self.onEnd.call(this);
    });
};

Fetcher.prototype.onError = function(error) { this.emit("error", error); };
Fetcher.prototype.onData  = function(chunk) { this.emit("data", chunk);  };
Fetcher.prototype.onClose = function(error) { this.emit("close", error); };
Fetcher.prototype.onDrain = function()      { this.emit("drain");        };
Fetcher.prototype.onPipe  = function(src)   { this.emit("pipe", src);    };
Fetcher.prototype.onEnd   = function()      { this.emit("end");          };

Fetcher.prototype.open = function(factory, cb)
{
    var self = this
      , stream = this.$stream = this.wrap(factory);

    this.validate.call(this, stream, function(err) {
        if (err)
            return self.emit("error", err);
        cb(stream);
    });
};

Fetcher.prototype.write = function(chunk, encoding, fd)
{
    if (this.$stream)
        this.$stream.write(chunk, encoding, fd);
    //Stream.write.call(this, chunk, encoding, fd);
};

Fetcher.prototype.pause = function()
{
    if (this.$stream)
        this.$stream.pause();
    Stream.pause.call(this);
};

Fetcher.prototype.resume = function()
{
    if (this.$stream)
        this.$stream.resume();
    Stream.resume.call(this);
};

Fetcher.prototype.end(chunk, encoding)
{
    if (this.$stream)
        this.$stream.end(chunk, encoding);
    Stream.end.call(this);
};

Fetcher.prototype.destroy = function()
{
    if (this.$stream)
        this.$stream.destroy();
    Stream.destroy.call(this);
};

Fetcher.prototype.destroySoon = function()
{
    if (this.$stream)
        this.$stream.destroySoon();
    Stream.destroySoon.call(this);
};

Fetcher.prototype.setEncoding = function(encoding)
{
    if (this.$stream)
        this.$stream.setEncoding(encoding);
    return this;
};
