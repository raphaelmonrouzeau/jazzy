var Schema  = require("./Schema");


Schema.prototype.invalidFieldsError =
    new Error("You must initialize a Schema with a fields object");

Schema.prototype.invalidFieldValidatorError =
    new Error("Schema validators must be functions");

Schema.prototype.invalidNameError =
    new Error("Schema field names must be strings");

var DeclarativeSchema = exports = module.exports = function(fields, options)
{
    if (typeof options === 'undefined')
        options = {};
    if (typeof options !== 'object')
        throw this.invalidOptionsError;

    if (!options.hasOwnProperty("compareStrictly")) {
        this.$compareStrictly   = !options.compareLoosely;
    } else {
        this.$compareStrictly   = !!options.compareStrictly;
    }

    if (!options.hasOwnProperty("forbidUselessFields")) {
        if (!options.hasOwnProperty("allowUselessFields")) {
            this.$allowUselessFields = undefined;
        } else {
            this.$allowUselessFields = !!options.allowUselessFields;
        }
    } else {
        this.$allowUselessFields = !options.forbidUselessFields;
    }

    if (options.hasOwnProperty("stopAtFirstError")) {
        this.$stopAtFirstError = !!options.stopAtFirstError;
    }


    Object.keys(fields).forEach(function(key) {
        var spec = fields[key];
        this.pushFieldValidator(key, spec);
     }, this);
};
Schema.prototype.addField = function(name, validator)
{
    if (typeof validator !== 'function')
        throw this.invalidFieldValidatorError;
    if (typeof name !== 'string')
        throw this.invalidFieldNameError;
    this.fields[name] = validator;
};

Schema.prototype.allowUselessFields = function(flag)
{
    this._allowUselessFields = flag ? true : false;
    return this;
};

Schema.prototype._onInvalid = function(name, value)
{
    return true;
};

Schema.prototype.onInvalid = function(func)
{
    this._onInvalid = func;
    return this;
};

Schema.prototype._onMissing = function(name)
{
    return true;
};

Schema.prototype.onMissing = function(func)
{
    this._onMissing = func;
    return this;
};

Schema.prototype._onUseless = function(name)
{
    return true;
};

Schema.prototype.onUseless = function(func)
{
    this._onUseless = func;
    return this;
};

