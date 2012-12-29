var DefineError = require("../index").Define;

module.exports = DefineError(
    "UselessFieldError",
    function(m,v) {
        if (arguments.length > 1)
            this.$set('value',v);
    },
    {class: "ValidationError"}
);
