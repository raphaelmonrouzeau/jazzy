
var Schema = module.exports = exports = function(fields, options)
{
    if (typeof fields === 'undefined')
        fields = {};
    if (typeof options === 'undefined')
        options = {};

    this._allowUselessFields = options.allowUselessFields ? true : false;

    if (typeof fields !== 'object')
        throw this.invalidFieldsError;
    
    for (k in fields) {
        if (typeof fields[k] !== 'function')
            throw this.invalidFieldValidatorError;
    }
    this.fields = fields;
};

Schema.invalidFieldsError          = new Error("You must initialize a Schema with a fields object"),
Schema.invalidFieldValidatorError  = new Error("Schema validators must be functions"),
Schema.invalidNameError            = new Error("Schema field names must be strings");

Schema.prototype.allowUselessFields = function(flag)
{
    this._allowUselessFields = flag ? true : false;
    return this;
};

Schema.prototype.addField = function(name, validator)
{
    if (typeof validator !== 'function')
        throw this.invalidFieldValidatorError;
    if (typeof name !== 'string')
        throw this.invalidFieldNameError;
    this.fields[name] = validator;
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

Schema.prototype._onBeginValidate = function()
{
    return;
};

Schema.prototype.onBeginValidate = function(func)
{
    this._onBeginValidate = func;
    return this;
};

Schema.prototype.validate = function(values, callback)
{
    this._onBeginValidate();

    var found_keys = [], parameters = {}, errors = [];

    for (var name in this.fields) {
        if (!values.hasOwnProperty(name)) {
            errors.push(["missing",name]);
            if (this._onMissing(name))
                return callback(errors,null);
        } else {
            try {
                parameters[name] = this.fields[name](values[name]);
            } catch (error) {
                errors.push(["invalid",name,error]);
                if (this._onInvalid(name, error))
                    return callback(errors,null);
            }
        }
    }
    if (!this._allowUselessFields) {
        for (var name in values) {
            if (!this.fields.hasOwnProperty(name)) {
                errors.push(["useless",name]);
                if (this._onUseless(name))
                    return callback(errors,null);
            }
        }
    }
    return callback(errors,parameters);
};

// a + b = cR
// ab    = cL
//
// x2 -sx +p = 0
// x2 -(a+b)x +ab = 0
//
//
// s2-s2+p=0 -> ab=0
// p2-sp+p=0 -> a2b2-(a+b)ab+ab=0 -> ab-a-b+1=0 -> 
