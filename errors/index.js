//
// http://stackoverflow.com/questions/464359/custom-exceptions-in-javascript
//
// Only works in V8 / Node.JS.
//
var Define = exports.Define = Error.Define = (function() {

    function define(obj, prop, value) {
        Object.defineProperty(obj, prop, {
            value: value,
            configurable: true,
            enumerable: false,
            writable: true
        });
    }

    return function(name, init, proto) {
        var Define;
        proto = proto || {};
        function build(message) {
            var self = this instanceof Define
                ? this
                : Object.create(Define.prototype);
            Error.apply(self, arguments);
            Error.captureStackTrace(self, Define);
            if (message != undefined) {
                define(self, 'message', String(message));
            }
            define(self, 'arguments', undefined);
            define(self, 'type', undefined);
            if (typeof init == 'function') {
                init.apply(self, arguments);
            }
            return self;
        }
        eval('Define = function ' + name + '() {' +
            'return build.apply(this, arguments); }');
        Define.prototype = Object.create(Error.prototype);
        define(Define.prototype, 'constructor', Define);
        for (var key in proto) {
            define(Define.prototype, key, proto[key]);
        }
        Object.defineProperty(Define.prototype, 'name', { value: name });
        return Define;
    }

})();

var NotFoundError       = exports.NotFoundError         = require("./NotFoundError")
  , ForbiddenError      = exports.ForbiddenError        = require("./ForbiddenError")
  , TimeoutError        = exports.TimeoutError          = require("./TimeoutError")
  , ConflictError       = exports.ConflictError         = require("./ConflictError")
  , GoneError           = exports.GoneError             = require("./GoneError")
  , LockedError         = exports.LockedError           = require("./LockedError")
  , NotImplementedError = exports.NotImplementedError   = require("./NotImplementedError");
