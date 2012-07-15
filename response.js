var http    = require('http');

var responsePrototype = http.ServerResponse.prototype;

responsePrototype.endWithJson = function(json)
{
    this.writeHead(200, {"Content-Type": "application/json"});
    this.write(JSON.stringify(json));
    this.end();
};

responsePrototype.endWithJsonRpcError = function(id, error)
{
    return this.endWithJson({ id: id, result: null, error: error });
};

responsePrototype.endWithJsonRpcResult = function(id, result)
{
    return this.endWithJson({ id: id, result: result, error: null });
};

responsePrototype.redirect = function(code, loc, body)
{
    this.statusCode = code;
    this.setHeader("Location", loc);
    if (body !== undefined) {
        this.end(body);
    } else {
        this.end("<p>redirecting to <a href='"+loc+"'/></p>");
    }
};

