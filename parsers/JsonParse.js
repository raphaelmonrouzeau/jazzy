var util                = require("util")
  , Stream              = require("stream").Stream;

var JsonParseParser = exports = module.exports = function(attributes)
{
    attributes = attributes || {};
    Object.keys(attributes).forEach(function(key) {
        this[key] = attributes[key];
    }, this);

    this.text = "";

    Stream.call(this);
};
util.inherits(JsonParseParser, Stream);

JsonParseParser.prototype.write = function(chunk, encoding)
{
    this.text += chunk;//.toString(encoding);
    return true;
};

JsonParseParser.prototype.end = function(chunk, encoding)
{
    if (chunk !== undefined)
        this.write(chunk, encoding);

    try {
        var json = this.json = JSON.parse(body);
    } catch (e) {
        this.ended = true;
        this.emit("error", e);
        return;
    }

    this.emit("data", json);
    this.emit("end");
};

JsonParseParser.prototype.pipe = function(dest, options)
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
