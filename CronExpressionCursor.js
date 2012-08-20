function expendStar(fieldName)
{
    switch (fieldName) {
        case 'minutes':
            return [ 0,59];
        case 'hours':
            return [ 0,23];
        case 'daysOfMonth':
            return [ 1,31];
        case 'months':
            return [ 1,12];
        case 'daysOfWeek':
            return [ 0, 6];
        case 'years':
            return [1970,2099];
    }
}

var CronExpressionCursor = exports = module.exports = function()
{
    this.fieldName = 'minutes';
    this.ranges = [];
    this.buffer = "";
    this.resetRange();
};

CronExpressionCursor.prototype.resetRange = function()
{
    this.range = { value: undefined, length: 1, increment: 1, last: false, orNextWorkingDay: false };
};

CronExpressionCursor.prototype.advance = function()
{
    var fieldName;
    switch (this.fieldName) {
        case 'minutes':
            fieldName = 'hours';
            break;
        case 'hours':
            fieldName = 'daysOfMonth';
            break;
        case 'daysOfMonth':
            fieldName = 'months';
            break;
        case 'months':
            fieldName = 'daysOfWeek';
            break;
        case 'daysOfWeek':
            fieldName = 'years';
            break;
        case 'years':
            this.fieldName = null;
            this.ranges = [];
            return false;
    }

    this.fieldName = fieldName;
    this.ranges = [];

    return true;
};

CronExpressionCursor.prototype.setValue = function(value)
{
    this.range.value = parseInt(value===undefined?this.buffer:value, 10);
    this.buffer = "";
};

CronExpressionCursor.prototype.setValueWith = function(value)
{
    this.buffer += value;
    this.range.value = parseInt(this.buffer, 10);
    this.buffer = "";
};

CronExpressionCursor.prototype.setValueWithStar = function()
{
    var keys = expendStar(this.fieldName);
    this.range.value = keys[0];
    this.range.length = keys[1]-keys[0]+1;
};

//CronExpressionCursor.prototype.setLast = function()

CronExpressionCursor.prototype.setBound = function()
{
    this.range.bound = parseInt(this.buffer, 10);
    this.buffer = "";
};

CronExpressionCursor.prototype.setIncrement = function()
{
    this.range.increment = parseInt(this.buffer, 10);
    this.buffer = "";
};

CronExpressionCursor.prototype.pushRange = function(buffer)
{
    this.ranges.push(this.range);
    this.resetRange();
    this.buffer = buffer===undefined ? "" : buffer;
};
