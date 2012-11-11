
var getOne = exports.getOne = function(spec)
{
    var innerPath   = spec.split(".")
      , moduleName  = innerPath.splice(0,1)[0]
      , symbolName  = innerPath.splice(-1,1)
      , host        = require(moduleName);

    if (!host)
        return undefined;

    innerPath.forEach(function(name) {
        host = host[name];
        if (!host)
            return undefined;
    });

    if (symbolName.length && symbolName[0])
        return host[symbolName[0]];
    return host;
};
