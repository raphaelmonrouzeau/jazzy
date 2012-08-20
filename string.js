var startsWith = exports.startsWith = function(str, prefix)
{
    return str.lastIndexOf(prefix, 0) === 0;
};

var endsWith = exports.endsWith = function(str, suffix)
{
    var i  = str.indexOf(suffix);

    return (i!==-1) && (i === (str.length-suffix.length));
};
