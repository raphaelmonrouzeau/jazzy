var util                = require("util")
  , Stream              = require("stream").Stream
  , sax                 = require("sax");

var SaxParser = exports = module.exports = function(attributes)
{
    var parser      = this.parser = sax.parser()
      , self        = this
      , callback    = function(){ self.callback.apply(self, arguments); };
 
    attributes = attributes || {};
    Object.keys(attributes).forEach(function(key) {
        this[key] = attributes[key];
    }, this);

    parser.ontext = function(text) {
        self.emit("text", text, callback);
    };

    parser.onopentag = function(node) {
        self.emit("opentag", node, callback);
    };

    parser.onclosetag = function(name) {
        self.emit("closetag", name, callback);
    };

    parser.onend = function() {
        self.emit("finished", callback);
        self.emit("end");
    };

    Stream.call(this);
};
util.inherits(SaxParser, Stream);

SaxParser.prototype.callback = function(err, data)
{
    if (err)
        return this.emit("error", err);
    this.emit("data", data);
};

SaxParser.prototype.write = function(chunk, encoding)
{
    return this.parser.write(chunk, encoding);
};

SaxParser.prototype.end = function(chunk, encoding)
{
    if (chunk !== undefined)
        this.write(chunk, encoding);
    this.parser.close();
};


SaxParser.prototype.pipe = function(dest, options)
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
