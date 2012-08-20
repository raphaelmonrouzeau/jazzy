var CronExpressionCursor = require('./CronExpressionCursor'),
    ScheduleElement      = require('./ScheduleElement');

function isSeparator(c)
{
    return ((c===' ')||(c==='\t')||(c==='\n'));
}

function isSlash(c)
{
    return c==='/';
}

function isComma(c)
{
    return c===',';
}

function isStar(c)
{
    return c==='*';
}

function isDigit(c)
{
    return (c==='0')||(c==='1')||(c==='2')||(c==='3')||
           (c==='4')||(c==='5')||(c==='6')||(c==='7')||
           (c==='8')||(c==='9');
}

function throwError(cursor, c, state)
{
    throw new Error("Invalid char '"+c+"' at state '"+state+"' for field '"+cursor.fieldName+"'");
}

function debug(cursor, c, state, cond)
{
    //console.log("c:"+c+" state:"+state+" cond:"+cond+" field:"+cursor.fieldName);
}

var Initial                     = "Initial",
    SkipSeparators              = "SkipSeparators",
    CompletingValue             = "CompletingValue",
    ExpectingRange              = "ExpectingRange",
    ExpectingSeparatorOrSlash   = "ExpectingSeparatorOrSlash",
    ExpectingIncrement          = "ExpectingIncrement",
    CompletingIncrement         = "CompletingIncrement",
    ExpectingBound              = "ExpectingBound",
    CompletingBound             = "CompletingBound",
    AdvanceCursor               = "AdvanceCursor",
    Error                       = "Error";

function SkipSeparatorsStateHandler(cursor, c)
{
    var state = SkipSeparators;

    if (isSeparator(c)) {
        debug(cursor, c, state, "isSeparator");
        return state;
    }
    if (isStar(c)) {
        debug(cursor, c, state, "isStar");
        if (cursor.buffer.length)
            throwError(cursor, c, state+" (value="+cursor.buffer+")");
        cursor.setValueWithStar();
        return ExpectingSeparatorOrSlash;
    }
    if (isDigit(c)) {
        debug(cursor, c, state, "isDigit");
        cursor.buffer += c;
        return CompletingValue;
    }
    return Error;
}

function ExpectingSeparatorOrSlashHandler(cursor, c)
{
    var state = ExpectingSeparatorOrSlash;

    if (isSeparator(c)) {
        debug(cursor, c, state, "isSeparator");
        return AdvanceCursor;
    }
    if (isSlash(c)) {
        debug(cursor, c, state, "isSlash");
        return ExpectingIncrement;
    }
    return Error;
}

function CompletingValueHandler(cursor, c)
{
    var state = CompletingValue;

    if (isDigit(c)) {
        debug(cursor, c, state, "isDigit");
        cursor.buffer += c;
        return state;
    }
    if (isSeparator(c)) {
        debug(cursor, c, state, "isSeparator");
        cursor.setValue();
        return AdvanceCursor;
    }
    if (isComma(c)) {
        debug(cursor, c, state, "isComma");
        cursor.setValue();
        cursor.pushRange();
        return ExpectingRange;
    }
    return Error;
}

function ExpectingRangeHandler(cursor, c)
{
    var state = ExpectingRange;

    if (isDigit(c)) {
        debug(cursor, c, state, "isDigit");
        cursor.buffer = c;
        return CompletingValue;
    }
    return Error;
}

function ExpectingIncrementHandler(cursor, c)
{
    var state = ExpectingIncrement;

    if (isDigit(c)) {
        debug(cursor, c, state, "isDigit");
        cursor.buffer = c;
        return CompletingIncrement;
    }
    return Error;
}

function CompletingIncrementHandler(cursor, c)
{
    var state = CompletingIncrement;

    if (isDigit(c)) {
        debug(cursor, c, state, "isDigit");
        cursor.buffer += c;
        return state;
    }
    if (isSeparator(c)) {
        debug(cursor, c, state, "isSeparator");
        cursor.setIncrement();
        return AdvanceCursor;
    }
    return Error;
}

function cursorToResult(cursor)
{
    return new ScheduleElement(cursor.fieldName, cursor.ranges);
}

var CronExpression = exports = module.exports = function()
{
    ;
};

CronExpression.prototype.parse = function(expression, callback)
{
    var cursor = new CronExpressionCursor();

    var state = SkipSeparators;

    for (var i in expression) {
        var c = expression[i];
        switch (state) {
            case AdvanceCursor:
                cursor.pushRange();
                callback(null, cursorToResult(cursor));
                cursor.advance();
            case SkipSeparators:
                state = SkipSeparatorsStateHandler(cursor, c);
                continue;
            case ExpectingSeparatorOrSlash:
                state = ExpectingSeparatorOrSlashHandler(cursor, c);
                continue;
            case CompletingValue:
                state = CompletingValueHandler(cursor, c);
                continue;
            case ExpectingRange:
                state = ExpectingRangeHandler(cursor, c);
                continue;
            case ExpectingIncrement:
                state = ExpectingIncrementHandler(cursor, c);
                continue;
            case CompletingIncrement:
                state = CompletingIncrementHandler(cursor, c);
                continue;
            case ExpectingBound:
                state = ExpectingBoundHandler(cursor, c);
                continue;
            case CompletingBound:
                state = CompletingBoundHandler(cursor, c);
                continue;
            case "Error":
                throwError(cursor, c, state);
            default:
                throwError(cursor, c, "UnknownState:"+state);
        }
    }
    for (; cursor.fieldName !== null; ) {
        cursor.setValueWithStar();
        cursor.pushRange();
        callback(null, cursorToResult(cursor));
        cursor.advance();
    }
}

