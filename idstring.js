var pathSafeString = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$-._~+,";

function makeNewId(str, len)
{
    var id = "", i, n;
    if (typeof len === 'undefined') len=8;
    for (i=0; i<len; i++) {
        n = Math.floor(Math.random()*str.length);
        id+=str[n];
    }
    return id;
};

var pathSafe = exports.pathSafe = function(len)
{
    return makeNewId(pathSafeString, len);
};
