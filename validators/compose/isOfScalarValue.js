var h   = require("./util")
  , SP  = h.SP;

module.exports = function(value)
{
    var sc          = h.scalar(value)
      , text        = SP+"if ($v !="+(this.strict?"=":"")+" "+sc+") {\n"
      , errText     = "new errors.FieldValueError($n, $v, "+sc+")";

    if (this.error = "throw")
        text += SP+SP+"throw "+errText+";\n";
    else
        text += SP+SP+"return $c("+errText+");\n";

    return text+SP+"}\n";
};
