var util    = require("util")
  , Stream  = require("stream").Stream;

/** Opens the fetcher on given path, URL, whatever the params addresses. And
 * starts the fetch processus.
 */

var Fetcher = exports = module.exports = function()
{
    var self = this
      , args = arguments;

    this.readable = true;
    this.writable = true;
    this.retryCount = 0;
    this.retryLimit = 4;
    Stream.call(this);
    process.nextTick(function(){self.tryToOpen.apply(self, args);});
};
util.inherits(Fetcher, Stream);

Fetcher.prototype.delay = function()
{
    return 92+this.retryCount*128;
};

Fetcher.prototype.tryToOpen = function()
{
    var self = this
      , args = arguments;

    [].push.call(args, function(err, stream) {
        if (err) {
            if (self.retryCount > self.retryLimit)
                return self.emit("error", err);
            setTimeout(function() { self.open.apply(self, args); }, self.delay());
            return ++self.retryCount;
        }
        self.validate.call(self, stream, function(err) {
            if (err)
                return self.emit("error", err);
            self.$stream = self.wrap(stream);
            self.start();
        });
    });
    this.open.apply(this, args);
};

Fetcher.prototype.start = function()
{
    return this;
};

/** Checks response.
 *
 * If returns an error the stream will send it, cancelling the run.
 */

Fetcher.prototype.validate = function(stream, cb)
{
    cb(null);
    return this;
};

Fetcher.prototype.wrap = function(stream)
{
    var self = this;

    return stream
    .on("error", function(error) {
        self.onError.call(self, error);
    })
    .on("data", function(chunk) {
        self.onData.call(self, chunk);
    })
    .on("close", function(error) {
        self.onClose.call(self, error);
    })
    .on("drain", function() {
        self.onDrain.call(self);
    })
    .on("pipe", function(src) {
        self.onPipe.call(self, src);
    })
    .on("end", function() {
        self.onEnd.call(self);
    });
};

Fetcher.prototype.onError = function(error) { this.emit("error", error); };
Fetcher.prototype.onData  = function(chunk) { this.emit("data", chunk);  };
Fetcher.prototype.onClose = function(error) { this.emit("close", error); };
Fetcher.prototype.onDrain = function()      { this.emit("drain");        };
Fetcher.prototype.onPipe  = function(src)   { this.emit("pipe", src);    };
Fetcher.prototype.onEnd   = function()      { this.emit("end");          };

Fetcher.prototype.initialize = function()
{
    var self = this;

    
};

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
        return this.$stream.write(chunk, encoding, fd);
    //Stream.write.call(this, chunk, encoding, fd);
    return false;
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

Fetcher.prototype.end = function(chunk, encoding)
{
    if (this.$stream)
        this.$stream.end(chunk, encoding);
    Stream.end.call(this, chunk, encoding);
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

Fetcher.prototype.pipe = function(dest, options)
{
    var self = this;

    options = options || {};

    this.on("data", function(data) {
        var ready = dest.write(data);
        if (ready === false) {
            self.pause();
            dest.once("drain", self.resume.bind(self));
        }
    });

    this.on("end", function() {
        dest.end();
    });

    return dest;
};
