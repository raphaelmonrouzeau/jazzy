var path       = require("path"),
    argumentum = require("argumentum"),
    jazutil    = require("./util");

var CommandLineApp = module.exports = exports = function()
{
    this.argumentum = {
        parser: null,
        lastCommandName: null,
        commandCallbacks: {},
        config: { options: {} }
    };
};

CommandLineApp.prototype.withScript = function(name)
{
    this.argumentum.scriptName = name;
    return this;
};

CommandLineApp.prototype.endWithUsage = function(header, code)
{
    code = code || 255;
    var usageMainString = this.argumentum.parser.getUsage();
    var usageString = header ? header + "\n\n" + usageMainString : usageMainString;
    this.argumentum.parser.print(usageString);
    process.exit(code);
};

CommandLineApp.prototype.addOption = function(name, options, callback)
{
    options._callback = jazutil.extract(options, "callback", function(){});
    options._required = jazutil.extract(options, "required", false);
    if (callback)
        options._callback = callback;
    this.argumentum.config.options[name] = options;
    return this;
};

CommandLineApp.prototype.addCommand = function(name, params, callback)
{
    var conf = this.argumentum.config,
        cb   = jazutil.extract(params, "callback") || callback;

    if (!params.options)
        params.options = {};
    if (!conf.commands)
        conf.commands = {};
    conf.commands[name] = params;
    this.argumentum.commandCallbacks[name] = cb;
    this.argumentum.lastCommandName = name;
    conf.commandRequired = true;
    return this;
};

CommandLineApp.prototype.addLastCommandOption = function(name, options, callback)
{
    return this.addCommandOption(this.argumentum.lastCommandName, name, options, callback);
};

CommandLineApp.prototype.addCommandOption = function(commandName, name, options, callback)
{
    var conf = this.argumentum.config;
    options._callback = jazutil.extract(options, "callback", function(){});
    options._required = jazutil.extract(options, "required", false);
    if (callback)
        options._callback = callback;
    conf.commands[commandName].options[name] = options;
    return this;
};

CommandLineApp.prototype.onMissingOption = function(callback)
{
    this.missingOptionHandler = callback;
    return this;
};

CommandLineApp.prototype.onUnknownOption = function(callback)
{
    this.unknownOptionHandler = callback;
    return this;
};

CommandLineApp.prototype.missingOptionHandler = function(app, name, args, kwargs)
{
    app.endWithUsage("Missing option <name>".replace("<name>", name));
};

CommandLineApp.prototype.unknownOptionHandler = function(app, name, args, kwargs)
{
    app.endWithUsage("Unknown option <name>".replace("<name>", name));
};

CommandLineApp.prototype.readCommandLineOptions = function()
{
    var conf = this.argumentum.config;
    if (!conf.script)
        conf.script = path.basename(process.argv.length < 2 ?
                                    (process.argv[0] || "") :
                                    process.argv[1]);

    this.argumentum.parser = argumentum.load(jazutil.copy(conf));

    var commandName = null,
        args        = [],
        kwargs      = this.argumentum.parser.parse();
        
    for (var i=0; i>=0; i++) {
        var n = i.toString();
        if (kwargs.hasOwnProperty(n)) {
            args.push(jazutil.extract(kwargs, n));
        } else break;
    }

    Object.keys(kwargs).forEach(function(name) {
        if (conf.options.hasOwnProperty(name))
            return;
        if (conf.commandRequired && conf.commands[args[0]].options.hasOwnProperty(name))
            return;
        this.unknownOptionHandler(this, name, args, kwargs);
    }, this);

    Object.keys(conf.options).forEach(function(name) {
        if (kwargs.hasOwnProperty(name)) {
            conf.options[name]._callback(this, name, args, kwargs);
        } else {
            if (conf.options[name]._required)
                this.missingOptionHandler(this, name, args, kwargs);
        }
    }, this);

    if (conf.commandRequired)
        Object.keys(conf.commands[args[0]].options).forEach(function(name) {
            if (kwargs.hasOwnProperty(name)) {
                conf.commands[args[0]].options[name]._callback(this, name, args, kwargs);
            } else {
                if (conf.commands[args[0]].options[name]._required)
                    this.missingOptionHandler(this, name, args, kwargs);
            }
        }, this);

    return { args: args, kwargs: kwargs };
};

CommandLineApp.prototype.run = function(main)
{
    var conf   = this.argumentum.config,
        _      = this.readCommandLineOptions(),
        args   = _.args,
        kwargs = _.kwargs;
    
    if (main)
        return main(this, args, kwargs);
    if (conf.commandRequired) {
        var command = args[0];
        return this.argumentum.commandCallbacks[command](this, command, args.slice(1), kwargs);
    }
};

