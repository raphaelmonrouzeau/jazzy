var path    = require("path");

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
        defaults = defaults || {};

        try {
            var basedir  = config.$basedir || process.cwd()
              , settings = require(path.join(basedir, filePath));
        } catch(e) {
            settings = defaults;
        }

        var parts  = keyPath.split('.')
          , target = config
          , key    = parts.splice(-1,1)[0];

        if (key === '')
            key = parts.splice(-1,1)[0];
        if (key)
            parts.push(key);

        for (var i=0,l=parts.length; i<l; i++) {
            var part = parts[i];
            if (part === '') {
                throw {message: "Invalid key path"};
            }
            if (typeof target[part] !== "object")
                target[part] = {};
            target = target[part];
        }

        Object.keys(settings).forEach(function(k) {
            target[k] = settings[k];
        }, config);
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

