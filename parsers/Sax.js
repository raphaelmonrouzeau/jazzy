var util                = require("util")
  , Stream              = require("stream").Stream
  , sax                 = require("sax");

var SaxParser = exports = module.exports = function()
{
    var parser      = this.parser = sax.parser()
      , self        = this;

    parser.ontext     = function(text) { self.onText(text, self.callback); };
    parser.onopentag  = function(node) { self.onOpenTag(node, self.callback); };
    parser.onclosetag = function(name) { self.onCloseTag(name, self.callback); };

    Stream.call(this);
};
util.inherits(SaxParser, Stream);

SaxParser.prototype.callback = function(err, data)
{
    if (err)
        return this.emit("error", err);
    this.emit("data", data);
};
