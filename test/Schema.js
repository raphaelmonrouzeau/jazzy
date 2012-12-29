var assert              = require("assert")
  , Schema              = require("./Schema")
  , compose             = require("./validators/compose")
  , MissingFieldError   = require("./errors/validation").MissingFieldError
  , UselessFieldError   = require("./errors/validation").UselessFieldError
  , FieldTypeError      = require("./errors/validation").FieldTypeError
  , FieldValueError     = require("./errors/validation").FieldValueError;

var schema = new Schema();

schema.p("integer", compose.fieldValidator(
    [compose.isOfType, "number"],
    {strict: true, error: "throw"}
));

schema.validate({}, function(errors, result) {
    assert.deepEqual([], errors);
    assert.deepEqual({}, result);
    console.log("1--------------------------------------------------->");

schema.validate({foo:1, bar:{}}, function(errors, result) {
    assert.deepEqual([], errors);
    assert.deepEqual({}, result);
    console.log("2--------------------------------------------------->");

schema.validate({integer:3.7}, function(errors, result) {
    assert.deepEqual([], errors);
    assert.deepEqual({integer:3.7}, result);
    console.log("3--------------------------------------------------->");

/* This mode works with synchrone validators only */

try {
    schema.validate({integer:"not a number"}, function(errors, result) {
        console.log(arguments);
        console.log(schema.fieldValidators[0].validator);
        assert.fail();
    });
} catch (e) {
    assert.equal("ValidationError", e.class);
    assert.equal("FieldTypeError: integer", e.toString());
    assert.equal("string", e.got);
    assert.equal("number", e.expected);
    console.log("4--------------------------------------------------->");
}

schema.p(true, function(n,v,c) { throw new UselessFieldError(n,v); });
/*schema.p(true, compose(
    [compose.isOfType, "number"],
    {strict: true, error: "throw"}
));*/

try {
    schema.validate({foo:1, bar:{}}, function(errors, result) {
        assert.fail();
    });
} catch (e) {
    //assert.equal("UselessFieldError: foo", e.toString());
    //assert.equal("UselessFieldError: bar", e.toString());
    //assert.equal(1, e.value);
    //assert.deepEqual({}, e.value);
    assert.equal("ValidationError", e.class);
    console.log("Should throw UselessFieldError: foo or bar, 1 or {}");
    console.log(e.toString(), e.value);
    console.log("5--------------------------------------------------->");
}

schema.p(false, function(n,c) { throw new MissingFieldError(n); });

try {
    schema.validate({}, function(errors, result) {
        assert.fail();
    });
} catch (e) {
    assert.equal("ValidationError", e.class);
    assert.equal("MissingFieldError: integer", e.toString());
    console.log("6--------------------------------------------------->");
}

var f = function(n,v,c) { if (this.strict && v !== 5.1) throw new FieldValueError(n, v, 5.1); else if (v != 5.1) throw new FieldValueError(n, v, 5.1); c(null, v); };

schema.p("number", f.bind({strict:true}));

try {
    schema.validate({integer:6,number:"5.1"}, function(errors, result) {
        assert.fail();
    });
} catch (e) {
    assert.equal("ValidationError", e.class);
    assert.equal("FieldValueError: number", e.toString());
    assert.equal("5.1", e.got);
    assert.equal(5.1, e.expected);
    console.log("7--------------------------------------------------->");
}

schema.p("numberAsString", f.bind({strict:false}));

schema.validate({integer:6,number:5.1,numberAsString:"5.1"}, function(errors, result) {
    assert.deepEqual([], errors);
    assert.deepEqual({integer:6,number:5.1,numberAsString:"5.1"}, result);
    console.log("8--------------------------------------------------->");

schema.d("integer", 0);

});
});
});
});
