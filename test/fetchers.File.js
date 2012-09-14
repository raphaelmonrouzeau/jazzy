var assert      = require("assert")
  , vows        = require("vows")
  , temp        = require("temp")
  , fs          = require("fs")
  , Fetcher     = require("../fetchers/File");

var contract = vows.describe("File fetcher");

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

                //for (var buffer="", i=0; i<LENGTH; i++)
                //    buffer += "a";
                //for (var i=0; i<COUNT; i++) {
                //    console.log(fs.writeSync(tmp.fd, buffer, 0, LENGTH, i*LENGTH), i*LENGTH);
                //    console.log(fs.writeSync(tmp.fd, buffer, 0, LENGTH, null), i*LENGTH);
                //    console.log(fs.fsyncSync(tmp.fd));
                //    console.log(fs.fstatSync(tmp.fd));
                //}
                for (var buffer="", i=0; i<LENGTH*COUNT; i++)
                    buffer += "a";
                fs.writeSync(tmp.fd, buffer, 0, LENGTH*COUNT, null);
                fs.fsync(tmp.fd, function(err) {
                    if (err) return self.callback(err);
                    fs.close(tmp.fd, function(err) {
                        if (err) return self.callback(err);
                        self.callback(null, tmp.path);
                    });
                });
            },
            "We create the fetcher, configure it and open it": {
                topic: function(path, tmp) {

                    var self = this
                      , fetcher = new Fetcher()
                      , total = 0;

                    fetcher.on("error", function(err) { self.callback(err); });
                    fetcher.on("begin", function()  { });
                    fetcher.on("data",  function(v) { total += v.length; });
                    fetcher.on("end",   function()  { self.callback(null, total); });

                    fetcher.open(path);
                },
                "And it consumed the right amount of characters": function(err, size) {
                    assert.equal(size, COUNT*LENGTH);
                }
            }
        }
    }
});

contract.export(module);
