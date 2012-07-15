var url     = require('url');
var util    = require('util');
var error   = require('./error');
var fs      = require('fs');
var jazutil = require('./util');

require('./response');

var defaults = {
    main: {
        base: process.cwd()
    },
    router: {
        routes: []
    }
};

function objectToArray()
{
    //console.log("objectToArray");
    //console.log("  arguments:");
    //console.log(arguments);
    var arr = new Array(),
        i   = 0;
    for (name in arguments) {
        arr[i++] = arguments[name];
    }
    return arr;
}

function getHandlerName()
{
    //console.log("getHandlerName");
    //console.log("  arguments:");
    //console.log(arguments);
    var comp,
        name = "on";
    for (key in arguments) {
        comp = arguments[key];
        name += comp.charAt(0).toUpperCase() + comp.slice(1).toLowerCase();
    }
    return name;
}

function getHandler()
{
    //console.log("getHandler");
    //console.log("  arguments:");
    //console.log(arguments);
    var arr  = objectToArray.apply(this, arguments),
        obj  = arr.shift(),
        name = getHandlerName.apply(this, arr);
    console.log("  obj:");
    console.log(obj);
    console.log("  arr:");
    console.log(arr);
    console.log("  name:");
    console.log(name);
    return obj[name];
}

function hasHandler()
{
    //console.log("hasHandler");
    //console.log("  arguments:");
    //console.log(arguments);
    return getHandler.apply(this, arguments);
}

function normalize_domain_routes(conf, domain, routes)
{
    if (!util.isArray(routes)) {
        if (typeof routes !== 'object') {
            console.log("Not normalizing anything: routes for "+domain+" are neither array nor object");
            return;
        }
        conf.router.routes[domain] = [routes];
        routes = conf.router.routes[domain];
    }
    for (var i=0; routes[i]; i++) {
        var route = routes[i];
    
        if (!util.isRegExp(route.pattern))
            route.pattern = new RegExp(route.pattern);
        if (typeof route.module === 'string') {
            route.module = fs.realpathSync(route.module);
            route.handler = require(route.module);
        }
        var routerPluginPath,
            routerPluginModule,
            routerPluginClass;
        if (typeof route.plugin === 'string') {
            routerPluginPath = fs.realpathSync(route.plugin);
        } else {
            routerPluginPath = "./plugins/base";
        }
        routerPluginModule = require(routerPluginPath);
        route.plugin = new routerPluginModule.RouterPlugin(conf, route);
    }
}

function normalize_routes(conf)
{
    var old_cwd = process.cwd();
    process.chdir(conf.main.base);
    
    if (conf.router.routes instanceof Array) {
        var routes = conf.router.routes;
        conf.router.routes = { '*': routes };
    }
    for (var key in conf.router.routes) {
        normalize_domain_routes(conf, key, conf.router.routes[key]);
    }

    process.chdir(old_cwd);
}

function plug_object_route(route, request, response)
{
    var methodHandler = getHandlerName(request.method, 'request');
    if (typeof route.handler[methodHandler] === 'function') {
        route.handler[methodHandler](request, response);
    } else if (typeof route.handler.onRequest === 'function') {
        route.handler.onRequest(request, response);
    }
   
    var methodHandler = getHandlerName(request.method, 'data');
    if (typeof route.handler[methodHandler] === 'function') {
        route.plugin.bind("data", route.handler[methodHandler]);
    } else if (typeof route.handler.onData === 'function') {
        route.plugin.bind("data", route.handler.onData);
    }

    var methodHandler = getHandlerName(request.method, 'end');
    if (typeof route.handler[methodHandler] === 'function') {
        route.plugin.bind("end", route.handler[methodHandler]);
    } else if (typeof route.handler.onEnd === 'function') {
        route.plugin.bind("end", route.handler.onEnd);
    } // @todo else bind 405 method not allowed if no request or data handler, or return 405 now
}

function plug_function_route(route, request, response)
{
    route.plugin.bind("end", function(){ route.handler(request, response); });
}

function plug_matching_route(routes, request, response, requestUrl)
{
    for (var i=0; routes[i]; i++) {
        var route = routes[i],
            m     = requestUrl.pathname.match(route.pattern);
        if (m) {
            var handlerType = typeof route.handler;

            if ( (handlerType!=='object') && (handlerType!=='function') ) {
                console.log(JSON.stringify({ module: "router", name: "start",
                                             kind: "unsupported_handle_type",
                                             pattern: route.pattern,
                                             handler_type: typeof route.handler }));
                continue;
            }

            delete m.index;
            delete m.input;
            request.args   = m.slice(1);
            request.kwargs = requestUrl.query;

            if (route.coding) {
                request.setEncoding(route.coding);
            } else {
                request.setEncoding("utf8");
            }

            if (typeof route.plugin.onBeginRouting === 'function') {
                route.plugin.onBeginRouting(request, response);
            }
            switch (handlerType) {
                case 'object':
                    plug_object_route(route, request, response);
                    break;
                case 'function':
                    plug_function_route(route, request, response);
                    break;
            }
            if (typeof route.plugin.onEndRouting === 'function') {
                route.plugin.onEndRouting();
            }

            return true;
        }
    }
    return false;
}

function router(conf)
{
    jazutil.setObjectDefaults(conf, defaults);

    normalize_routes(conf);

    return function (request, response)
    {
        var hosts_routes    = conf.router.routes,
            host            = request.headers.host === undefined ? '*' : request.headers.host,
            wildcard_routes = hosts_routes["*"] === undefined ? [] : hosts_routes["*"],
            host_routes     = hosts_routes[host] === undefined ? wildcard_routes : hosts_routes[host];

        console.log(JSON.stringify({ module: "router", name: "start", path: request.url, host: request.headers.host }));

        requestUrl = url.parse(request.url, true);
  
        if (!plug_matching_route(host_routes, request, response, requestUrl)) {
            if (!plug_matching_route(wildcard_routes, request, response, requestUrl)) {
                error.error404(request, response);
            }
        }
    }
}

exports.router = router;
