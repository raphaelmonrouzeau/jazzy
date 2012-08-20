var redis       = require('redis'),
    redisClient = redis.createClient(),
    Schema      = require('jazzy/schema'),
    validators  = require('jazzy/validators');

redisClient.on("error", function (err) {
    console.log("OnRedisError " + err);
});

function hmgetResultToObject(keys, fields)
{
    var obj = {}, i=0;
    for (key in keys) {
        obj[keys[key]] = fields[i];
        i++;
    }
    return obj;
}

var Client = exports.Client = function()
{
    
};
