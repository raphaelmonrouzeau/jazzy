

var bisectLeft = exports.bisectLeft = function(a, x, lo, hi)
{
    var mid;
    
    if (typeof(lo) == 'undefined')
        lo = 0;
    if (typeof(hi) == 'undefined')
        hi = a.length;
    while (lo < hi) {
        mid = Math.floor((lo + hi) / 2);
        if (x < a[mid])
            hi = mid;
        else
            lo = mid + 1;
    }
    return lo;
};

var bisectLeftInsert = exports.bisectLeftInsert = function(a, x)
{
    a.splice(bisect_left(a,x), 0, x);
};

