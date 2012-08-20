

var ScheduleElement = exports = module.exports = function(elementName, ranges)
{
    this.name = elementName;
    this.discreteValues = {};
    for (var i in ranges) {
        //console.log(""+i+":");
        //console.log(ranges[i]);
        var range = ranges[i];
        for (var j = range.value; j < (range.value+range.length); j += range.increment)
            this.discreteValues[j] = true;
    }
};

ScheduleElement.prototype.has = function(value)
{
    var f = this.discreteValues.hasOwnProperty(value);
    //console.log(this.name+" has "+f);
    return f;
};
