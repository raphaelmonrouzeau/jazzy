var h   = require("./util")
  , SP  = h.SP;

module.exports = function(type)
{
    var typeName    = h.quote(type.toString())
      , text        = SP+"if (typeof $v !== "+typeName+") {\n"
      , errText     = "new errors.FieldTypeError($n, typeof $v, "+typeName+")";
    
    if (this.error === "throw")
        text += SP+SP+"throw "+errText+";\n";
    else
        text += SP+SP+"return $c("+errText+");\n";

    return text+SP+"}\n";
};
