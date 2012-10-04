var util = require("util");

function stringify(obj)
{
    try {
        return JSON.stringify(obj);
    } catch (e) {
        return JSON.stringify(InternalError(obj.id, e));
    }
}

var idIsInvalid = exports.idIsInvalid = function(id)
{
    switch (typeof id) {
        case "string": return false;
        case "number":
            if (id !== parseInt(id))
                return "Numeric ids should be integers";
            return false;
        default:
            return "Ids should be strings or integers, not "+typeof id;
    }
};

var Response = exports.Response = function(id, data)
{
    return {
        id: idIsInvalid(id) ? null : id,
        jsonrpc: "2.0",
        result: data
    };
};

var ResponseString = exports.ResponseString = function(id, data)
{
    return stringify(Response(id, data));
};

var _Error = exports.Error = function(id, code, message, data)
{
    var responseObj = {
        id: id || null,
        jsonrpc: "2.0",
        error: { code: code, message: message }
    };
    if (data)
        responseObj.error.data = data;
    return responseObj;
};

var ErrorString = exports.ErrorString = function(id, code, message, data)
{
    return stringify(Error(id, code, message, data));
};

var ParseError = exports.ParseError = function(id, data)
{
    return _Error(id, -32700, "Parse error", data);
};

var InvalidRequest = exports.InvalidRequest = function(id, data)
{
    return _Error(id, -32600, "Invalid Request", data);
};

var MethodNotFound = exports.MethodNotFound = function(id, data)
{
    return _Error(id, -32601, "Method not found", data);
};

var InvalidParams = exports.InvalidParams = function(id, data)
{
    return _Error(id, -32602, "Invalid params", data);
};

var InternalError = exports.InternalError = function(id, data)
{
    return _Error(id, -32603, "Internal error", data);
};

var ServerError = exports.ServerError = function(id, n, data)
{
    if (typeof n !== "number" || n < 0 || n > 99 || parseInt(n) !== n)
        return InternalError(id, "Requested to create a server error but didn't received valid server error number");
    return _Error(id, -32000-n, "Server error", data);
};

function decodeJson(candidate, cb)
{
    var data;
    try {
        data = JSON.parse(candidate);
    } catch (error) {
        return cb(ParseError(null, error));
    }
    cb(null, data);
}

function parseRequestObject(obj, cb)
{
    if (obj.hasOwnProperty("id")) {
        var reason = idIsInvalid(obj.id);
        if (reason)
            return cb(InvalidRequest(null, reason));
    }
    if (obj.jsonrpc !== "2.0")
        return cb(InvalidRequest(obj.id, "Incompatible jsonrpc version"));
    if (typeof obj.method !== "string")
        return cb(InvalidRequest(obj.id, "Invalid method name"));
    cb(null, obj);
};

var parseRequest = exports.parseRequest = function(candidate, cb)
{
    decodeJson(candidate, function(error, data) {
        if (error)
            return cb(error);
        if (!util.isArray(data))
            return parseRequestObject(data, cb);
        if (data.length < 1)
            return cb(InvalidRequest(data.id, "JSON-RPC batch of requests must have at least one member"));

        var a = [];
        for (var i in data) {
            parseRequestObject(data[i], function(err, res) {
                a.push(err ? err : res);
            });
        }
        cb(null, a);
    });
};
