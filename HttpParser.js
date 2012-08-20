var http    = require("http");

var HttpParser = exports = module.exports = function()
{
};

HttpParser.prototype.validateResponse = function(response)
{
    return true;
};

HttpParser.prototype.onError = function(error)
{
    console.log(error);
};

HttpParser.prototype.run = function(parser, options)
{
    var self    = this
      , req     = http.request(options, function(res) {
            if (self.validateResponse(res) === true) {
                res.setEncoding("utf8");
                res.on("data", function(chunk) {
                    parser.write(chunk.toString("utf8"));
                });
                res.on("close", function(e) {
                    self.onError(e);
                });
                res.on("error", function(e) {
                    self.onError(e);
                });
                res.on("end", function() {
                    parser.close();
                });
            } else {
                res.destroy();
            }
        });

    req.on("error", function(e) {
        self.onError(e);
    });
    req.end();
}
