var util    = require("util")
  , http    = require("http")
  , Fetcher = require("./Base");

var HttpFetcher = exports = module.exports = function()
{
    Fetcher.call(this);
};
util.inherits(HttpFetcher, Fetcher);

/*
 * Params are the same than ``http.request``:
 *
 * - host: A domain name or IP address of the server to issue the request to.
 *   Defaults to 'localhost'.
 * - hostname: To support url.parse() hostname is preferred over host
 * - port: Port of remote server. Defaults to 80.
 * - localAddress: Local interface to bind for network connections.
 * - socketPath: Unix Domain Socket (use one of host:port or socketPath)
 * - method: A string specifying the HTTP request method. Defaults to 'GET'.
 * - path: Request path. Defaults to '/'. Should include query string if any.
 *   E.G. '/index.html?page=12'
 * - headers: An object containing request headers.
 * - auth: Basic authentication i.e. 'user:password' to compute an
 *   Authorization header.
 * - agent: Controls Agent behavior. When an Agent is used request will
 *   default to Connection: keep-alive. Possible values:
 * - undefined (default): use global Agent for this host and port.
 * - Agent object: explicitly use the passed in Agent.
 * - false: opts out of connection pooling with an Agent, defaults request to
 *   Connection: close.
 *
 * Plus the following:
 *
 * - requestBody: A string or buffer with the content of the body of the
 *   request. Defaults to ''.
 */

HttpFetcher.prototype.open = function(params)
{
    var self = this
      , requestBody = params.requestBody || '';
    
    delete params.requestBody;

    this.$request = http.request(params, function(response) {
        self.validate.call(this, response, function(err) {
            if (err)
                return self.emit("error", err);
            response.setEncoding("utf8");
            response.on("error", function(err) {
                self.emit("error", err);
            });
            response.on("data", function(chunk) {
                self.emit("data", chunk);
            });
            response.on("close", function(err) {
                self.emit("error", err);
            });
            response.on("end", function() {
                self.emit("end");
            });
            self.$response = response;
            self.emit("begin");
        });
    });
    //function nthNextTick(n,f)
    //{
    //    if (n===0)
    //        f();
    //    else
    //        process.nextTick(function(){nthNextTick(n-1,f);});
    //}
    //nthNextTick(0,function(){console.log("======================\nrequest\n",self.$request);});
    //nthNextTick(2,function(){console.log("======================\nrequest\n",self.$request);});
    //nthNextTick(6,function(){console.log("======================\nrequest\n",self.$request);});
    //nthNextTick(12,function(){console.log("======================\nrequest\n",self.$request);});
    //nthNextTick(24,function(){console.log("======================\nrequest\n",self.$request);});
    this.$request.on("error", function(err) {
        self.emit("error", err);
    });
    this.$request.end(requestBody);
    return this;
};

HttpFetcher.prototype.pause = function()
{
    this.$response.pause();
};

HttpFetcher.prototype.resume = function()
{
    this.$response.resume();
};

