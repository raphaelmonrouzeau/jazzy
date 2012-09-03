var http    = require("http")
  , util    = require("util")
  , events  = require("events");

var HttpParser = exports = module.exports = function()
{
    events.EventEmitter.call(this);
};
util.inherits(HttpParser, events.EventEmitter);

HttpParser.prototype.validateResponse = function(response)
{
    return true;
};

HttpParser.prototype.run = function(parser, options)
{
    var self    = this
      , req     = http.request(options, function(res) {
            if (self.validateResponse(res) === true) {
                res.setEncoding("utf8");
                res.on("data", function(chunk) {
                    chunk = chunk.toString("utf8");
                    parser.write(chunk);
                    self.emit("data", chunk);
                });
                res.on("close", function(e) {
                    self.emit("close", e);
                });
                res.on("error", function(e) {
                    self.emit("error", e);
                });
                res.on("end", function() {
                    parser.close();
                    self.emit("end");
                });
            } else {
                res.destroy();
                self.emit("error", {name:"InvalidResponse",message:"Response wasn't valid"});
            }
        });

    req.on("error", function(e) {
        self.emit("error", e);
    });
    req.end();
}
