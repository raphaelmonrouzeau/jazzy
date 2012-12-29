
var fieldValidatorText = exports.fieldValidatorText = function()
{
    var m       = arguments.length
      , h       = require("./util")
      , SP      = h.SP
      , text    = "function $validator($n,$v,$c) {\n"
      , options;

    if (typeof arguments[m-1] === "object") {
        options = [].pop.call(arguments);
    } else {
        options = {};
    }

    [].slice.call(arguments).forEach(function(spec) {
        console.log("=>");
        text += spec[0].apply(options, spec.slice(1));
        //console.log(text);
    }); 

    text += SP+"$c(null, $v);\n}\n";
    console.log(text);
    return text;
};

var fieldValidator = exports.fieldValidator = function()
{
    var txt    = fieldValidatorText.apply(this, arguments)
      , errors = require("../../errors/validation");

    eval(txt);
    return $validator;
};


var helpers = ["isOfType", "isTypeIn", "isTypeInArray",
               "isOfScalarValue", "isScalarValueIn", "isScalarValueInArray"];

helpers.forEach(function(name) {
    exports[name] = require("./"+name);
});

/*
var f = compose(
    [compose.isTypeIn, "number", "string", "boolean"],
    [compose.isScalarValueIn, 5.1, 5, 3, null, "plop"],
    {strict: true, error: "throw"}
);

console.log(f);

f("testField", null, function(err, res) {
    console.log("...................................(");
    console.log(arguments);
    console.log(err.toString());
    console.log("...................................)");
});
*/
