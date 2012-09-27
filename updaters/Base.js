var Stream  = require("stream")
  , util    = require("util");

var Updater = module.exports = exports = function(attributes)
{
    attributes = attributes || {};

    Object.keys(attributes, function(key) {
        this[key] = attributes[key];
    }, this);
    
    this._began = false;
    this.reset();

    Stream.call(this);
};
util.inherits(Updater, Stream);

Updater.prototype.reset = function()
{
    this._updates = {};
    this._performing = false;
    this._waiting = false;
    this._counter = -1;
    this.readable = true;
    this.writable = true;
};

Updater.prototype.isPerforming = function()
{
    for (var i in this._updates)
        return true;
    return false;
};

Updater.prototype.checkPerforming = function()
{
    var performing = this.isPerforming()
      , self = this;

    if (performing !== this._performing)
        this.emit("performing", performing);
    this._performing = performing;
    if (this._waiting && !this._performing)
        this.emit("fini", function(){self.fini.apply(self,arguments);});
};

Updater.prototype.update = function(data)
{
    var counter, callback, self=this;

    if (!this._began)
        this.emit("begin");
    this._counter++;
    this._updates[this._counter] = true;
    counter = this._counter;
    this.checkPerforming();
    this.emit("update", counter, data, function(err, result) {
        if (err)
            self.emit("error", err);
        else if (result !== undefined)
            self.emit("data", result);
        delete self._updates[counter];
        self.checkPerforming();
    });
};

Updater.prototype.setEncoding = function(encoding)
{
    this.encoding = encoding;
    return this;
};

Updater.prototype.fini = function(err, result)
{
    if (err)
        return this.emit("error", err);
    else if (result !== undefined)
        return this.emit("data", result);
    this.emit("end");
};

Updater.prototype.end = function(chunk, encoding)
{
    var performing = this.performing
      , self = this;

    if (chunk !== undefined)
        this.write(chunk, encoding);
    this.emit("endofdata", performing);
    if (!performing)
        return this.emit("fini", function(){self.fini.apply(self,arguments);});
    this._waiting = true;
};

Updater.prototype.write = function(chunk, encoding)
{
    this.update(chunk);
};

Updater.prototype.pipe = function(dest, options)
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
