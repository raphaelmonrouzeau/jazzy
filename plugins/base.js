function BaseRouterPlugin(conf, route)
{
    ;
}

BaseRouterPlugin.prototype.onBeginRouting = function(request, response)
{
    this.request  = request;
    this.response = response;
};

BaseRouterPlugin.prototype.bind = function(eventName, callable)
{
    var self = this;
    switch (eventName) {
        case 'data':
            this.request.addListener(eventName, function(chunk) {
                return callable(self.request, self.response, chunk);
            });
            break;
        default:
            this.request.addListener(eventName, function() {
                return callable(self.request, self.response);
            });
    }
};

BaseRouterPlugin.prototype.onEndRouting = function()
{
    ;
}

exports.RouterPlugin = BaseRouterPlugin;
