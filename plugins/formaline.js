var formaline = require('formaline');
var jazutil = require('../util.js');

var defaults = {
    holdFilesExtensions:        true,
    uploadRootDir:              "/tmp/",
    mkDirSync:                  false,
    getSessionID : function ( request ) {
        return ( ( request.sessionID ) || ( request.sid ) ||
                ( ( request.session && request.session.id ) ? request.session.id : null ) );
    },
    requestTimeOut:             5000,
    resumeRequestOnError:       true,
    sha1sum:                    false,
    emitFileProgress:           false,
    emitProgress:               false,
    uploadThreshold:            4 * 1024,
    serialzedFieldThreshold:    4 * 1024,
    maxFileSize:                1 * 1024,
    checkContentLength:         true,
    removeIncompleteFiles:      true,
    logging: 'debug:on,1:on,2:off,3:off,4:off,console:on,file:off,record:off',
    listeners: { }
};

function FormalineRouterPlugin(conf, route)
{
    this.conf        = conf;
    this.route       = route;
}

FormalineRouterPlugin.prototype.onBeginRouting = function(request, response)
{
    var form_config  = {};

    this.request     = request;
    this.response    = response;
    this.form_config = form_config;

    if (request.method !== 'POST')
        return;

    jazutil.setdefaults(form_config, defaults);

    this.form_config.listeners.loadend = function ( json, response, callback ) {
        // console.log( '\n\033[1;32mPost Done..\033[0m' );
        // console.log( '-> ' + new Date() + '\n' );
        // console.log( '-> request processed! \n' );
        // console.log( '\n-> stats -> ' + JSON.stringify( json.stats, null, 4 ) + '\n' );
        // console.log( '\n Initial Configuration : ' + JSON.stringify( form_config.initialConfig, function ( key, value ) {
        //     if ( typeof value === 'function' ) {
        //         return '..';
        //     }
        //     return value;
        // }, 4 ) + '\n' );
        // console.log( '\n-> fields received: [ { .. } , { .. } ] \n   ****************\n'
        //            + JSON.stringify( json.fields, null, 1 ) + '\n' );
        // console.log( '\n-> files written: [ { .. } , { .. } ] \n   **************\n '
        //            + JSON.stringify( json.files, null, 1 ) + '\n' );
        // if ( form_config.removeIncompleteFiles ) {
        //     console.log( '\n-> partially written ( removed ): [ { .. } , { .. } ] \n   *****************\n'
        //                + JSON.stringify( json.incomplete, null, 1 ) + '\n' );
        // } else {
        //     if ( json.incomplete.length !== 0 ) {
        //         console.log( '\n-> partially written ( not removed ): \n   *****************\n'
        //                    + JSON.stringify( json.incomplete, null, 1 ) + '\n' );
        //     }
        // }
        try {
            callback(json);
        } catch ( err ) {
            console.log( 'error', err.stack );
        }
    };
};

FormalineRouterPlugin.prototype.bind = function(eventName, callable)
{
    var request     = this.request,
        response    = this.response,
        form_config = this.form_config;

    switch (eventName) {
        case "message":
            this.form_config.listeners.message = function(json) {
                return callable(request, response, json);
            }
            break;
        case "error":
            this.form_config.listeners.error = function(json) {
                return callable(request, response, json);
            }
            break;
        case "abort":
            this.form_config.listeners.abort = function(json) {
                return callable(request, response, json);
            }
            break;
        case "timeout":
            this.form_config.listeners.timeout = function(json) {
                return callable(request, response, json);
            }
            break;
        case "load":
            this.form_config.listeners.load = function(json) {
                return callable(request, response, json);
            }
            break;
        case "loadstart":
            this.form_config.listeners.loadstart = function(json) {
                return callable(request, response, json);
            }
            break;
        case "fileprogress":
            this.form_config.listeners.fileprogress = function(json, payload) {
                return callable(request, response, json, payload);
            }
            break;
        case "progress":
            this.form_config.listeners.progress = function(json) {
                return callable(request, response, json);
            }
            break;
        case "end":
            this.callback = function(json)
            {
                console.log("======================================>");
                console.log(json);
                request.postData = json;
                return callable(request, response);
            };
            break;
        case 'data':
            request.addListener(eventName, function(chunk) {
                return callable(request, response, chunk);
            });
            break;
        default:
            request.addListener(eventName, function() { return callable(request, response); });
    }
};

FormalineRouterPlugin.prototype.onEndRouting = function()
{
    if (typeof this.callback === 'function') {
        if (typeof this.route.handler.onMessage === 'function')
            this.bind("message", this.route.handler.onMessage);
        if (typeof this.route.handler.onError === 'function')
            this.bind("error", this.route.handler.onError);
        if (typeof this.route.handler.onAbort === 'function')
            this.bind("abort", this.route.handler.onAbort);
        if (typeof this.route.handler.onTimeout === 'function')
            this.bind("timeout", this.route.handler.onTimeout);
        if (typeof this.route.handler.onLoad === 'function')
            this.bind("load", this.route.handler.onLoad);
        if (typeof this.route.handler.onLoadStart === 'function')
            this.bind("loadstart", this.route.handler.onLoadStart);
        if (typeof this.route.handler.onFileProgress === 'function')
            this.bind("fileprogress", this.route.handler.onFileProgress);
        if (typeof this.route.handler.onProgress === 'function')
            this.bind("progress", this.route.handler.onProgress);
        this.form = new formaline( this.form_config );
        this.form.parse(this.request, this.response, this.callback);
    }
}

exports.RouterPlugin = FormalineRouterPlugin;
// -> there should be a default "NOT IMPLEMENTED METHOD"
