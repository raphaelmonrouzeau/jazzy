var assert      = require("assert")
  , vows        = require("vows")
  , http        = require("http")
  , util        = require("util")
  , events      = require("events")
  , Schema      = require("../Schema");

var contract = vows.describe("Schema (test suite 1)");

contract.addBatch({
    "After creating Schema 1": {
        topic: function() {
            var self    = this
              , schema  = new Schema()
                .p(Schema.prototype.chokeOnUselessField)
                .p(Schema.prototype.chokeOnMissingField)
                .p("integer", function(v,n) {
                    console.log("first integer validator1", arguments);
                    console.log("first integer validator2", arguments.callee);
                    if (parseInt(v) !== v) return n("bad integer");
                    console.log("v",v);
                    console.log("n",n);
                    n(null, v);
                })
                .p("integer", function(v,n) {
                    if (v < 10) return n("too low");
                    n(null, v);
                })
                .p("integer", function(v,n) {
                    if (v >= 100) return n("too high");
                    n(null, v);
                });
            return schema;
        },
        "We get a schema with 3 field validators": {
            topic: function(schema) {

            }
        },
        "That chokes on useless fields,": {
            topic: function(schema) {
                schema.validate({integer: 10, useless: true}, this.callback);
            },
            "Yes": function(err, result) {
                console.log("err", err);
                console.log("result", result);
            }
        },
        "And chokes on missing fields": {
            topic: function(schema) {
                schema.validate({}, this.callback);
            },
            "Yes": function(err, result) {
                console.log("err", err);
                console.log("result", result);
            }
        }
    }
});

contract.export(module);
