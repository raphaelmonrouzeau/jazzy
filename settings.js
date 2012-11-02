var path    = require("path")
  , _       = require("underscore");

var config = module.exports = {};

Object.defineProperty(config, '$_basedir', {
    enumerable:     false,
    writable:       true,
    configurable:   true,
    value:          undefined
});

Object.defineProperty(config, '$basedir', {
    enumerable:     false,
    get: function()
    {
        return config.$_basedir;
    },
    set: function(value)
    {
        if (value[0] === '/') {
            config.$_basedir = value;
            return;
        }
        config.$_basedir = path.join(process.cwd(), value);
    }
});

Object.defineProperty(config, '$readTo', {
    enumerable:     false,
    writable:       true,
    configurable:   true,
    value: function(filePath, keyPath, defaults)
    {
        var rv = false;
        try {
            var basedir  = config.$basedir || process.cwd()
              , settings = require(path.join(basedir, filePath))
              , rv = true;
        } catch (e) {
            if (defaults)
                settings = defaults;
            else
                throw e;
        }

        var parts  = keyPath.split('.')
          , target = config
          , key    = parts.splice(-1,1)[0];

        while (key === '')
            key = parts.splice(-1,1)[0];

        for (var i=0,l=parts.length; i<l; i++) {
            var part = parts[i];
            if (part === '') {
                throw {message: "Invalid key path"};
            }
            if (typeof target[part] !== "object")
                target[part] = {};
            target = target[part];
        }

        if (key !== undefined)
            target[key] = _.clone(settings);
        else
            _.extend(target, settings);

        return rv;
    }
});

Object.defineProperty(config, '$read', {
    enumerable:     false,
    writable:       true,
    configurable:   true,
    value: function(filePath, defaults)
    {
        return config.$readTo(filePath, ".", defaults);
    }
});

