
var crypto = require('crypto');

var signatureFieldNameAlreadyHereError = new Error("Signature field name already exists in object"),
    objectToSignIsNotAnObjectError     = new Error("Object to sign is not an object");

var getHMacDigest = exports.getHMacDigest = function(secret, fields, algorithm, encoding)
{
    if (typeof algorithm === 'undefined')
        algorithm = 'sha256';
    if (typeof encoding === 'undefined')
        encoding = 'hex';

    var hmac = crypto.createHmac(algorithm, secret),
        keys = Object.keys(fields).sort(),
        numberOfKeys = keys.length,
        first = true;

    for (var key in keys) {
        if (first) {
            hmac.update('?');
            first = false;
        } else
            hmac.update('&');
        hmac.update(encodeURIComponent(key));
        hmac.update('=');
        hmac.update(encodeURIComponent(fields[key]));
    }
    //~!*()'
    return hmac.digest(encoding);
}

function addAuthFieldsToObject(secret, obj, fieldName)
{
    if (typeof fieldName === 'undefined')
        fieldName = 'signature';
    //if (typeof obj !== 'object')
    //    throw objectToSignIsNotAnObjectError;
    if (typeof obj[fieldName] !== 'undefined')
        throw signatureFieldNameAlreadyHereError;

    obj[fieldName] = getHMacDigest(secret, obj);
}

