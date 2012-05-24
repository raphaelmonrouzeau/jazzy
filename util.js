function newId(l)
{
    var id = "", i, n;
    if (typeof l === 'undefined') l=8;
    for (i=0; i<l; i++) {
        n = Math.floor(Math.random()*65);
        id+="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$-_.+,"[n];
    }
    return id;
}

function setdefaults(dict1, dict2)
{
    for (name in dict2) {
        if (typeof dict1[name] === 'undefined') {
            dict1[name] = dict2[name];
        } else if (typeof dict1[name] === 'object'
                && typeof dict2[name] === 'object') {
            setdefaults(dict1[name], dict2[name]);
        }
    }
}

exports.setdefaults = setdefaults
exports.newId       = newId
