var redis       = require('redis')
  , util        = require("util")
  , winston     = require("winston");

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

    client.logcbfunc = function(keyfunc)
    {
        var func = function(name, kparts, record, next)
        {
            var operation
              , key
              , meta = {};
        
            if (!name) {
                operation  = "operation";
            } else {
                operation  = name;
            }
        
            if (!kparts) {
                key = "hive "+keyfunc("");
            } else {
                key = keyfunc.apply(this,kparts);
            }
            
            if (record !== undefined) {
                meta.givenValue = record;
            }
        
            var cb = function(err,res)
            {
                if (err)
                    return winston.error(util.format("Redis %s error on %s: %s", operation, key, err.toString()),
                                         {err:err,meta:meta});
                winston.silly(util.format("Redis %s success on %s", operation, key),
                              {res:res,meta:meta});
                if (next)
                    next();
            };
            return cb;
        };
        return func;
    };

    return client;
};
