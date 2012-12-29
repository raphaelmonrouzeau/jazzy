var Schema = module.exports = exports = function()
{
    this.$validator             = this.defaultValidatorFactory;

    this.objectValidators       = [];
    this.fieldValidators        = [];
    this.uselessFieldValidators = [];
    this.missingFieldValidators = [];
    this.defaultValues          = {};
};

Schema.prototype.defaultValidatorFactory = function(v)
{
    return v;
};

Schema.prototype.defaultValue = Schema.prototype.d = function(name, value)
{
    this.defaultValues[name] = value;
    return this;
};

Schema.prototype.pushObjectValidator = function(spec)
{
    var validator = this.$validator(spec);

    this.objectValidators.push(validator);
    return this;
};

Schema.prototype.unshiftObjectValidator = function(spec)
{
    var validator = this.$validator(spec);

    this.objectValidators.unshift(validator);
    return this;
};

Schema.prototype.pushFieldValidator = function(name, defaultValue, spec)
{
    var validator;

    if (arguments.length === 2) {
        validator = this.$validator(defaultValue);
        this.fieldValidators.push({ name:name, validator:validator });
    } else if (arguments.length === 3) {
        validator = this.$validator(spec);
        this.fieldValidators.push({ name:name, defaultValue:defaultValue, validator:validator });
    }

    return this;
};

Schema.prototype.unshiftFieldValidator = function(name, defaultValue, spec)
{
    var validator;

    if (arguments.length === 2) {
        validator = this.$validator(defaultValue);
        this.fieldValidators.unshift({ name:name, validator:validator });
    } else if (arguments.length === 3) {
        validator = this.$validator(spec);
        this.fieldValidators.unshift({ name:name, defaultValue:defaultValue, validator:validator });
    }

    return this;
};

Schema.prototype.pushUselessFieldValidator = function(spec)
{
    var validator = this.$validator(spec);

    console.log("[1;31m -", this.uselessFieldValidators, "[0m");
    this.uselessFieldValidators.push(validator);
    console.log("[1;31m -", this.uselessFieldValidators, "[0m");
    return this;
};

Schema.prototype.unshiftUselessFieldValidator = function(spec)
{
    var validator = this.$validator(spec);

    this.uselessFieldValidators.unshift(validator);
    return this;
};

Schema.prototype.pushMissingFieldValidator = function(spec)
{
    var validator = this.$validator(spec);

    this.missingFieldValidators.push(validator);
    return this;
};

Schema.prototype.unshiftMissingFieldValidator = function(spec)
{
    var validator = this.$validator(spec);

    this.missingFieldValidators.unshift(validator);
    return this;
};

Schema.prototype.pushValidator =
Schema.prototype.p =
function(fieldName, fieldValue, spec)
{
    console.log("[1;33m",fieldName, spec, "[0m");
    if (arguments.length === 1) {
        return this.pushObjectValidator(fieldName);
    } else if (arguments.length === 2) {
        if (typeof fieldName === "string")
            return this.pushFieldValidator(fieldName, fieldValue);
        if (fieldName === true)
            return this.pushUselessFieldValidator(fieldValue);
        if (fieldName === false)
            return this.pushMissingFieldValidator(fieldValue);
    } else if (arguments.length === 3) {
        if (typeof fieldName === "string")
            return this.pushFieldValidator(fieldName, fieldValue, spec);
        if (fieldName === true)
            return this.pushUselessFieldValidator(spec);
        if (fieldName === false)
            return this.pushMissingFieldValidator(spec);
    }
    return this;
};

Schema.prototype.unshiftValidator =
Schema.prototype.u =
function(fieldName, spec)
{
    if (arguments.length === 1) {
        return this.unshiftObjectValidator(fieldName);
    } else if (arguments.length === 2) {
        if (typeof fieldName === "string")
            return this.unshiftFieldValidator(fieldName, fieldValue);
        if (fieldName === true)
            return this.unshiftUselessFieldValidator(fieldValue);
        if (fieldName === false)
            return this.unshiftMissingFieldValidator(fieldValue);
    } else if (arguments.length === 3) {
        if (typeof fieldName === "string")
            return this.unshiftFieldValidator(fieldName, fieldValue, spec);
        if (fieldName === true)
            return this.unshiftUselessFieldValidator(spec);
        if (fieldName === false)
            return this.unshiftMissingFieldValidator(spec);
    }
    return this;
};


Schema.prototype.iterateMissingFieldValidators = function(name, errors, result, i, m, done)
{
    console.log("call iterateMissingFieldValidators", i, m);
    if (i===m)
        return done();

    var validator  = this.missingFieldValidators[i];

    validator(name, function(err) {
        if (err) {
            errors.push(err);
            return done();
        }
        this.iterateMissingFieldValidators(name, errors, result, ++i, m, done);
    });
};

// "And I love him"
// "My lady got " "why do you grip so long" "why do you sleep upstairs"

Schema.prototype.validateMissingField = function(name, errors, result, done)
{
    console.log("call validateMissingField");
    this.iterateMissingFieldValidators(
        name, errors, result,
        0, this.missingFieldValidators.length,
        done
    );
};

Schema.prototype.validateFields = function(values, errors, result, done)
{
    this.iterateFieldValidators(
        values, errors, result, {}, {},
        0, this.fieldValidators.length,
        done
    );
};

Schema.prototype.iterateFieldValidators = function(values, errors, result, erroredFields, missingFields, i, m, done)
{
    console.log("call iterateValidators", i, m);
    if (i===m)
        return done(erroredFields);

    var obj         = this.fieldValidators[i]
      , validator   = obj.validator
      , name        = obj.name
      , self        = this
      , next;

    next = function() {
        self.iterateFieldValidators(values, errors, result, erroredFields, missingFields, ++i, m, done);
    };

    if (!values.hasOwnProperty(name)) {
        if (missingFields.hasOwnProperty(name)) {
            return next();
        }
        missingFields[name] = true;
        if (this.defaultValues.hasOwnProperty(name)) {
            result[name] = this.defaultValues[name];
            return next();
        }
        return this.validateMissingField(name, errors, result, next);
    }

    /// store if field had error, store its current converted value !!!!! !!!!! !!!!!
    if (erroredFields.hasOwnProperty(name)) {
        return next();
    }

    var value = result.hasOwnProperty(name) ? result[name] : values[name];

    validator(name,value,function(err, res) {
        if (err) {
            errors.push(err);
            erroredFields[name] = true;
            delete result[name];
            return next();
        }
        result[name] = res;
        return next();
    });
};

Schema.prototype.iterateUselessFieldValidators = function(name, value, errors, result, i, m, done)
{
    console.log("call iterateUselessFieldValidators", i, m);
    console.log("[1;32mOC1iterateUselessFieldValidators", this.uselessFieldValidators, "[0m");
    if (i===m)
        return done();

    var validator   = this.uselessFieldValidators[i]
      , self        = this;

    console.log("[1;32mOC2iterateUselessFieldValidators", this.uselessFieldValidators, "[0m");
    validator(name,value,function(err) {
        if (err) {
            errors.push(err);
            return done();
        }
        self.iterateUselessFieldValidators(name, value, errors, result, ++i, m, done);
    });
};

Schema.prototype.iterateUselessFields = function(values, uselessFields, errors, result, i, m, done)
{
    console.log("call iterateUselessFields", i, m);
    console.log("[1;32mOC1iterateUselessFields", this.uselessFieldValidators, "[0m");

    if (i===m)
        return done();
    if (i>6) throw -1;
    var name    = uselessFields[i]
      , next;

    var self=this;
    next = function() {
        console.log("[1;32mOC3iterateUselessFields", self.uselessFieldValidators, "[0m");
        self.iterateUselessFields(values, uselessFields, errors, result, ++i, m, done);
    };
    console.log("[1;32mOC2iterateUselessFields", this.uselessFieldValidators, "[0m");
    this.iterateUselessFieldValidators(name, values[name], errors, result, 0, this.uselessFieldValidators.length, next);
};

Schema.prototype.iterateObjectValidators = function(errors, result, i, m, done)
{
    console.log("call iterateObjectValidators", i, m);
    if (i===m)
        return done();

    var validator   = this.objectValidators[i]
      , self        = this;

    validator(errors,result,function(err) {
        if (err) {
            errors.push(err);
            return done();
        }
        self.iterateObjectValidators(errors, result, ++i, m, done);
    });
};

Schema.prototype.validate = function(values, errors, result, cb)
{
    console.log("call validate");
    if (!result) {
        cb = errors;
        errors = [];
        result = {};
    } else if (!cb) {
        cb = result;
        result = {};
    }

    var self = this;

    console.log("[1;32mBiterateValidators", this.uselessFieldValidators, "[0m");
    this.validateFields(values, errors, result, function(erroredFields) {
        console.log("[1;32mOiterateValidators", self.uselessFieldValidators, "[0m");

        var uselessFields = [];

        Object.keys(values).forEach(function(name) {
            if (result.hasOwnProperty(name) || erroredFields.hasOwnProperty(name))
                return;
            uselessFields.push(name);
        });

        console.log("[1;32mBiterateUselessFields", self.uselessFieldValidators, "[0m");
        self.iterateUselessFields(values, uselessFields,
                                  errors, result, 0, uselessFields.length,
                                  function() {

            self.iterateObjectValidators(errors, result, 0, self.objectValidators.length,
                                         function() {
                cb(errors, result);
            });

        });
    });
};
