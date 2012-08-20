var Job = exports = module.exports = function(handler, args, kwargs)
{
    this.handler = handler;
    this.args = args;
    this.kwargs = kwargs;
    this.schedule = {
        minutes: {},
        hours: {},
        daysInMonth: {},
        daysInWeek: {}
    };
};

Job.prototype.addToSchedule = function(fieldName, choices, selectors)
{
    console.log("addToSchedule choices:"+choices+" selectors:("+typeof(selectors)+")"+JSON.stringify(selectors));
    if (!selectors.length)
        for (var c in choices)
            this.schedule[fieldName][choices[c]] = true;
    else
        for (var c in choices)
            for (var s in selectors) {
                console.log("choice=("+typeof(choices[c])+")"+choices[c]+" "+
                            "selector=("+typeof(selectors[s])+")"+selectors[s]);
                if (!(choices[c] % selectors[s]))
                    this.schedule[fieldName][choices[c]] = true;
            }
};

