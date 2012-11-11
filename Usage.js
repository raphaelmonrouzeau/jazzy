var util    = require("util")
  , path    = require("path");

var Usage = exports = module.exports = function(name, options)
{
    options = options || {};

    this.show       = options.show || console.log;
    this.name       = name;
    this.options    = [];
    this.args       = [];
};

Usage.prototype.addOption = function(c, options)
{
    options = options || {};

    var argumentName = options.argumentName
      , helpLine     = options.helpLine;

    this.options.push({c:c, argumentName: argumentName, helpLine: helpLine});
    return this;
};

Usage.prototype.addArgument = function(name, options)
{
    options = options || {};

    var required = options.required;

    this.args.push({name:name, required:required});
    return this;
};

Usage.prototype.getGetoptSpec = function()
{
    var str = "";

    this.options.forEach(function(option) {
        str += option.c;
        if (option.argumentName)
            str += ":";
    });

    return str;
};

Usage.prototype.getUsage = function()
{
    var str         = util.format("Usage: %s", path.basename(this.name))
      , hasArgs     = false
      , hasOptions  = false;

    this.args.forEach(function(arg) {
        if (hasArgs) {
            str += "|"+arg.name;
        } else {
            str += " "+arg.name;
            hasArgs = true;
        }
    });

    str += "\n";

    this.options.forEach(function(option) {
        if (!hasOptions) {
            str += "\n";
            hasOptions = true;
        }
        str += "    -"+option.c;
        if (option.helpLine) {
            str += ": "+option.helpLine;
        }
        str += "\n";
    });

    return str;
};

Usage.prototype.showUsage = function(prepend, exit)
{
    var message = "";

    if (prepend) {
        message += prepend+"\n\n";
    }
    message += this.getUsage();
    this.show(message);

    if (exit !== undefined)
        process.exit(parseInt(exit));
};

