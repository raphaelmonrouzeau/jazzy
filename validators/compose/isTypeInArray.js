var h   = require("./util")
  , SP  = h.SP;

module.exports = function(types)
{
    var first       = true
      , text        = SP+"var tmp = typeof $v;\n"+SP+"if ("
      , errText     = "new errors.FieldTypeError($n, tmp, "+JSON.stringify(types)+")";

    types.forEach(function(type) {
        var typeName = h.quote(type.toString());
        if (!first) {
            text += " && tmp!=="+typeName;
        } else {
            text += "tmp!=="+typeName;
            first = false;
        }
    });

    if (this.error === "throw")
        text += ") {\n"+SP+SP+"throw "+errText+";\n";
    else
        text += ") {\n"+SP+SP+"return $c("+errText+");\n";

    return text+SP+"}\n";
};
