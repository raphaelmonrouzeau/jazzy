var setDefaults = exports.setDefaults = function(dict1, dict2)
{
    for (name in dict2) {
        if (typeof dict1[name] === 'undefined') {
            dict1[name] = dict2[name];
        } else if (typeof dict1[name] === 'object'
                && typeof dict2[name] === 'object') {
            setDefaults(dict1[name], dict2[name]);
        }
    }
}

var validate = exports.validate = function(schema, values, hook)
{
    var found_keys = [];

    for (var kv in values) {
        var found = false;
        for (var ks in schema) {
            if (kv === ks) {
                var r = schema[ks](values[kv]);
                if (!r)
                    hook(kv, "invalid", r);
                found = true;
                break;
            }
        }
        if (!found)
            hook(kv, "spurious");
        else
            found_keys.append(kv);
    }
    for (var ks in schema) {
        var found = false;
        for (var kf in found_keys) {
            if (ks === kf) {
                found = true;
                break;
            }
        }
        if (!found)
            hook(ks, "missing");
    }
}

var extract = exports.extract = function(obj, name, defaultValue)
{
    var item;

    if (name in obj) {
        item = obj[name];
        delete obj[name];
    } else {
        item = defaultValue;
    }
    return item;
};

var copy = exports.copy = function(src)
{
    if (src === null || typeof src !== 'object')
        return src;
    var dst;
    if (src instanceof Date) {
        dst = new Date();
        dst.setTime(src.getTime());
        return dst;
    }
    if (src instanceof Array) {
        dst = [];
        for (var i = 0, len = obj.length; i < len; ++i)
            dst[i] = copy(src[i]);
        return dst;
    }
    if (src instanceof Object) {
        dst = {};
        for (var key in src)
            if (src.hasOwnProperty(key))
                dst[key] = copy(src[key]);
        return dst;
    }
    return dst;
};
