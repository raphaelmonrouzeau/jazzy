var h                       = require("./util")
  , SP                      = h.SP
  , isScalarValueInArray    = require("./isScalarValueInArray");

module.exports = function()
{
    return isScalarValueInArray([].slice.call(arguments));
};

