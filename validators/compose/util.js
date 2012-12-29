var SP = exports.SP = "    ";

var quote = exports.quote = function(str)
{
    var dst = '"';

    for (var i=0; i<str.length; i++) {
        var c = str[i];
        
        if (c === "\n")
            dst += "\\n";
        else if (c === "\t")
            dst += "\\t";
        else if (c === "\\")
            dst += "\\\\";
        else if (c === "\r")
            dst += "\\r";
        else if (c === "\\")
            dst += "\\\\";
        else if (c === '"')
            dst += '\\"';
        else
            dst += c;
    }
    dst += '"';
    return dst;
};


var scalar = exports.scalar = function(s)
{
    var typeName = typeof s;

    switch (typeName) {
        case "number":
        case "boolean":
            return s.toString();
        case "null":
        case "undefined":
            return typeName;
        case "string":
            return quote(s);
        case "object":
            if (s === null)
                return "null";
        default:
            return quote(s.toString());
    }
};
