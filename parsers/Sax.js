var util                = require("util")
  , Stream              = require("stream").Stream
  , sax                 = require("sax");

var SaxParser = exports = module.exports = function()
{
    var parser      = this.parser = sax.parser()
      , self        = this;

    parser.ontext = function(text) {
        self.emit("text", text, function(){ self.callback.apply(self, arguments); });
    };

    parser.onopentag = function(node) {
        self.emit("opentag", node, function(){ self.callback.apply(self, arguments); });
    };

    parser.onclosetag = function(name) {
        self.emit("closetag", name, function(){ self.callback.apply(self, arguments); });
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
