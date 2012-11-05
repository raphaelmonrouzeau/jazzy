var util    = require("util")
  , Mailer  = require("./Base");

var ErrorMailer = exports = module.exports = function(options)
{
    Mailer.call(this, "error", options);
};
util.inherits(ErrorMailer, Mailer);


ErrorMailer.prototype.getParams = function(error, cb)
{
    var locals = {
        err: error,
        title: error.toString(),
        message: error.message,
        stackTrace: error.stack
    };
    cb(null, locals);
};
