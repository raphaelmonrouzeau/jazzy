var redis       = require('redis');

function hmgetResultToObject(keys, fields)
{
    var obj = {}, i=0, valid=false;
    for (key in keys) {
        var val = fields[i];
        if (!valid)
            if (val !== null)
                valid=true;
        obj[keys[key]] = fields[i];
        i++;
    }
    if (valid)
        return obj;
    return null;
}

module.exports = exports = function(port_arg, host_arg, options)
{
    var client = redis.createClient(port_arg, host_arg, options);

    client.hmgeto = function(key, keys, cb)
    {
        client.hmget(key, keys, function(error, fields) {
            if (error)
                return cb(error);
            cb(null, hmgetResultToObject(keys, fields));
        });
    };
    
    client.key = function()
    {
        return [].slice.call(arguments).join(':');
    };
    
    client.keyfunc = function()
    {
        var args = arguments;
    
        var func = function() {
            [].unshift.apply(arguments, args);
            return client.key.apply(this, arguments);
        };
        return func;
    };
    
    client.hmgetofunc = function()
    {
        var keyfunc = [].pop.apply(arguments)
          , keys    = [].slice.call(arguments);
    
        var func = function() {
            var cb  = [].pop.apply(arguments)
              , key = keyfunc.apply(this, arguments);
            client.hmgeto(key, keys, cb);
        };
        return func;
    };
    
    client.delfunc = function(keyfunc)
    {
        var func = function() {
            var cb  = [].pop.call(arguments)
              , key = keyfunc.apply(this, arguments);
            client.del(key, cb);
        };
        return func;
    };
    
    client.keysfunc = function(keyfunc)
    {
        var func = function() {
            var cb  = [].pop.call(arguments);
    
            [].push.call(arguments, '*');
            client.keys(keyfunc.apply(this, arguments), cb);
        };
        return func;
    };

    client.existsfunc = function(keyfunc)
    {
        var func = function() {
            var cb = [].pop.call(arguments);

            client.exists(keyfunc.apply(this, arguments), cb);
        };
        return func;
    };

    return client;
};
