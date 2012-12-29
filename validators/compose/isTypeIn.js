var h               = require("./util")
  , isTypeInArray   = require("./isTypeInArray")
  , SP              = h.SP;

module.exports = function()
{
    return isTypeInArray([].slice.call(arguments));
};
