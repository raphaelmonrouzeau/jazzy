var h   = require("./util")
  , SP  = h.SP;

module.exports = function(values)
{
    var first       = true
      , text        = SP+"if ("
      , errText     = "new errors.FieldValueError($n, $v, "+JSON.stringify(values)+")";

    values.forEach(function(value) {
        var literal = h.scalar(value);
        if (!first) {
            text += " && tmp!=="+literal;
        } else {
            text += "tmp!=="+literal;
            first = false;
        }
    });

    if (this.error === "throw")
        text += ") {\n"+SP+SP+"throw "+errText+";\n";
    else
        text += ") {\n"+SP+SP+"return $c("+errText+");\n";

    return text+SP+"}\n";
};
