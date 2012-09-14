var assert      = require("assert")
  , vows        = require("vows")
  , http        = require("http")
  , util        = require("util")
  , events      = require("events")
  , Fetcher     = require("../fetchers/Http");

var contract = vows.describe("HTTP fetcher");

var Generator = function(options)
{
    this.options = options = options || {};
    if (typeof options.count!=="number" || parseInt(options.count)!==options.count)
        options.count = 16;
    if (typeof options.length!=="number" || parseInt(options.length)!==options.length)
        options.length = 32768;

    events.EventEmitter.call(this);
}
util.inherits(Generator, events.EventEmitter);

Generator.prototype.generate = function()
{
    for (var i=0; i<this.options.count; i++) {
        var buff = "";
        for (var j=0; j<this.options.length; j++)
            buff += "a";
        this.emit("data", buff);
    }
    this.emit("end");
};

var Server = function(options)
{
    var self = this;

    this.options   = options = options || {};
    this.generator = new Generator(options);
    this.server    = http.createServer(function(request, response) {
        request.on("end", function() {
            self.generator.removeAllListeners();
            self.generator.on("data", function(v){response.write(v);});
            self.generator.on("end", function(){response.end();});
            process.nextTick(function(){self.generator.generate()});
        });
    });
};

Server.prototype.listen = function(cb)
{
    var self = this;

    this.server.listen(0, function() { cb(self.server.address()); });
};

var COUNT = 12;
var LENGTH = 12000;

contract.addBatch({
    "After running HTTP server": {
        topic: function() {
            var self = this
              , server = new Server({count:COUNT, length:LENGTH});

            server.listen(function(addr){self.callback(null,addr);});
        },
        "After creating HTTP Fetcher we configure it and open it and receive packets": {
            topic: function(addr) {
                var self = this
                  , packets = []
                  , fetcher = new Fetcher();

                fetcher.on("error", function(err) { self.callback(error); });
                fetcher.on("begin", function()  { });
                fetcher.on("data",  function(v) { packets.push(v); });
                fetcher.on("end",   function()  { self.callback(null, packets); });

                fetcher.open(util.format("http://localhost:%d", addr.port));
            },
            "With the right total size": function(err, packets) {
                for (var i=0, size=0; i<packets.length; i++) {
                    size+=packets[i].length;
                }
                assert.equal(size, COUNT*LENGTH);
            }
        }
    }
});

contract.export(module);
