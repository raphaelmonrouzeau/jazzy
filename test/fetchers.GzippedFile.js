var assert      = require("assert")
  , vows        = require("vows")
  , temp        = require("temp")
  , fs          = require("fs")
  , zlib        = require("zlib")
  , Fetcher     = require("../fetchers/GzippedFile");

var contract = vows.describe("Gzipped file fetcher");

var COUNT = 12;
var LENGTH = 12000;

contract.addBatch({
    "After creating a temporary file": {
        topic: function() {
            temp.open({prefix:"vows-sfrshoppingd-",suffix:".txt"}, this.callback);
        },
        "And filling it": {
            topic: function(tmp) {
                var self = this;

                for (var buffer="", i=0; i<LENGTH*COUNT; i++)
                    buffer += "a";
                zlib.gzip(buffer, function(err, gzippedBuffer) {
                    if (err) return self.callback(err);
                    fs.writeSync(tmp.fd, gzippedBuffer, 0, gzippedBuffer.length, null);
                    fs.fsync(tmp.fd, function(err) {
                        if (err) return self.callback(err);
                        fs.close(tmp.fd, function(err) {
                            if (err) return self.callback(err);
                            self.callback(null, buffer);
                        });
                    });
                });
            },
            "We create the fetcher, configure it and open it": {
                topic: function(buffer, tmp) {

                    var self = this
                      , fetcher = new Fetcher()
                      , total = 0
                      , content = "";

                    fetcher.on("error", function(err) { self.callback(err); });
                    fetcher.on("begin", function()  { });
                    fetcher.on("data",  function(v) { content+=v; total += v.length; });
                    fetcher.on("end",   function()  { self.callback(null, {total:total,buffer:buffer,content:content}); });

                    fetcher.open(tmp.path);
                },
                "And it consumed the right amount of characters": function(err, obj) {
                    assert.equal(err, null);
                    assert.equal(obj.total, COUNT*LENGTH);
                    //console.log(buffer.slice(
                }
            }
        }
    }
});

contract.export(module);
