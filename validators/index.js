
var invalidNumberError      = exports.invalidNumberError    = new Error("Invalid Number")
  , numberTooLowError       = exports.numberTooLowError     = new Error("Number too low")
  , numberTooHighError      = exports.numberTooHighError    = new Error("Number too high")
  , invalidDateError        = exports.invalidDateError      = new Error("Invalid Date")
  , stringNotHexError       = exports.stringNotHexError     = new Error("String is not in hexadecimal form")
  , stringTooShortError     = exports.stringTooShortError   = new Error("String is too short")
  , stringTooLongError      = exports.stringTooLongError    = new Error("String is too long");

var isNumber = exports.isNumber = function(n)
{
    return !isNaN(parseFloat(n)) && isFinite(n);
}

var getNumberFromString = exports.getNumberFromString = function(str)
{
    var n = parseFloat(str);
    return isNaN(n) ? null : n;
}

var validateLatitude = exports.validateLatitude = function(latitude, options)
{
    options.acceptNumberNotation    = options.acceptNumberNotation || true;
    options.acceptTimeNotation      = options.acceptTimeNotation || false;
    options.checkBounds             = options.checkBounds || false;

    if (isNaN(latitude) || !isFinite(latitude)) {
        throw invalidNumberError;
    }
    latitude = parseFloat(latitude);
    return latitude;
};

var validateLongitude = exports.validateLongitude = function(longitude, options)
{
    options.acceptNumberNotation    = options.acceptNumberNotation || true;
    options.acceptTimeNotation      = options.acceptTimeNotation || false;
    options.checkBounds             = options.checkBounds || false;

    if (isNaN(longitude) || !isFinite(longitude)) {
        throw invalidNumberError;
    }
    longitude = parseFloat(longitude);
    return longitude;
};

var validateInteger = exports.validateInteger = function(integer, options)
{
    options = options || {};

    var min = parseInt(options.min);
        min = isNaN(min) ? undefined : min;
    var max = parseInt(options.max);
        max = isNaN(max) ? undefined : max;

    integer = parseInt(integer);
    if (isNaN(integer) || !isFinite(integer)) {
        if (options.hasOwnProperty("def"))
            return options.def;
        throw invalidNumberError;
    }
    if ((min!==undefined) && (integer<min)) {
        throw numberTooLowError;
    }
    if ((max!==undefined) && (integer>max)) {
        throw numberTooHighError;
    }
    return integer;
};

var validateNumberFromString = exports.validateNumberFromString = function(str)
{
    var n = getNumberFromString(str);
    if (n === null)
        throw invalidNumberError;
    return dt;
}

var isDate = exports.isDate = function(d)
{
  if (Object.prototype.toString.call(d) !== "[object Date]")
      return false;
  return !isNaN(d.getTime());
}

var getDateFromString = exports.getDateFromString = function(str)
{
    var dt = new Date(str);
    return isNaN(dt.getTime()) ? null : dt;
}

var validateDateFromString = exports.validateFromString = function(str)
{
    var dt = getDateFromString(str);
    if (dt === null)
        throw invalidDateError;
    return dt;
}

var isHexString = exports.isHexString = function(s)
{
    ;
}

var validateHexString = exports.validateHexString = function(str, options)
{
    var l = str.length,
        m = str.match(/[0-9A-Ba-b]+/);

    if (m === null) {
        throw stringNotHexError;
    }

    if (typeof options === 'undefined')
        options = {}

    if ( (options.minLen!==undefined) && (l<options.minLen) )
        throw stringTooShortError;
    if ( (options.maxLen!==undefined) && (l<options.maxLen) )
        throw stringTooLongError;
    //if (l&1)
    //    throw hexStringNotOnByteBoundaryError;
    //if (options.convert)
    //    ;// convert to bytes
    return str;
}
