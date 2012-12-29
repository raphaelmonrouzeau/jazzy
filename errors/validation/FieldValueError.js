var DefineError = require("../index").Define;

module.exports = DefineError(
    "FieldValueError",
    function(m,v,e) {
        if (arguments.length > 1)
            this.$set('got',v);
        if (arguments.length > 2)
            this.$set('expected',e);
    },
    {class: "ValidationError"}
);
