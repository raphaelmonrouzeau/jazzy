var string = require("underscore.string");

var HttpRoute = exports = module.exports = function(pattern)
{
    this.methods = {};
    if (typeof pattern === 'function')
        this.match = pattern;
    else if (typeof pattern === 'string')
        this.match = function(req, res) {
            ;
        };
    else if (util.isRegexp(pattern))
        this.match = function(req, res) {
            var m = req.url.path.match(pattern);
            return m ? m.slice(1) : null;
        };
    //else if 
    else this.match = function(){return null;};
    //request.args   = m.slice(1);
    //m     = requestUrl.pathname.match(route.pattern);
    //if (!plug_matching_route(host_routes, request, response, requestUrl)) {
    //if (!plug_matching_route(wildcard_routes, request, response, requestUrl)) {
    //error.error404(request, response);
};

HttpRoute.prototype.on = function(methodName, eventName, cb)
{
    if (typeof matcherData === function)
        this.routes[methodName][eventName] = {
            match: matcherData,
            handle: cb };
    else if (util.isRegexp(matcherData))
        this.routes[methodName][eventName] = {
            match: function(req,res) { req.url.path.match() },
            handle: cb };
};

HttpRoute.prototype.bind = function(req, res)
{
    
};

HttpRoute.prototype.onGetEnd = function(matcherData, cb)
{
    return this.on("get", "end", matcherData, cb);
};

