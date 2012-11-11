var Usage   = require("./Usage")
  , getopt  = require("posix-getopt");

var Getopt = exports = module.exports = function(name, options)
{
    options = options || {};

    var usage       = this.usage = new Usage(name, options);
    this.options    = {};
    this.args       = {};
    this.hasArgs    = false;
};

Getopt.prototype.addOption = function(c, options, cb)
{
    if (arguments.length === 2 && typeof options === "function") {
        cb = options;
        options = {};
    } else {
        options = options || {};
    }
    options.handler = cb;

    this.usage.addOption(c, options);
    this.options[c] = options;
    return this;
};

Getopt.prototype.addArgument = function(name, options)
{
    this.usage.addArgument(name, options);
    this.args[name] = options;
    this.hasArgs = true;
    return this;
};

Getopt.prototype.parse = function(argv)
{
    var parser = new getopt.BasicParser(this.usage.getGetoptSpec(), argv)
      , options = {}
      , args = []
      , opt;
    
    while ((opt = parser.getopt()) !== undefined) {
        if (this.options[opt.option]) {
            var option = this.options[opt.option]
              , name   = option.name || opt.option
              , hasArg = !!option.argumentName;

            if (hasArg)
                options[name] = opt.optarg;
            else
                options[name] = true;

            if (option.handler)
                option.handler(name, options[name]);
        } else {
            usage.showUsage("Unknown option '"+opt.option+"'", 254);
        }
    }
    
    args = argv.slice(parser.optind());

    if (this.hasArgs) {
        if (args.length === 0) {
            usage.showUsage("Requires at least one argument", 253);
        } else if (!this.args.hasOwnProperty(args[0])) {
            usage.showUsage("Unknown non option argument", 252);
        }
    }

    return {options:options, arguments:args};
};
