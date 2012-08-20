var jazutil = require('./util')
  , Job = require('./Job')
  , CronExpression = require('./CronExpression')
  , array = require('./array')
  , cronExpression = new CronExpression();

var Scheduler = exports = module.exports = function()
{
    this.jobs = {};
    this.queue = { times: [], jobs: [] };
};

function daysInMonth(year, month)
{
    var n = new Date(year, month, 0).getUTCDate()+1;
    //console.log(""+year+"/"+month+" has "+n+" days");
    return n;
}

Scheduler.prototype.getNextSchedule = function(base, schedule, relative)
{
    relative = relative ? true : false;

    var year     = base.getUTCFullYear(),
        month    = base.getUTCMonth()+1,
        day      = base.getUTCDate(),
        hour     = base.getUTCHours(),
        minute   = base.getUTCMinutes()+(relative?0:1);

    for (; year<2100; year++) {
        //console.log("year:"+year);
        if (schedule.years.has(year))
            for (; month<13; month++) {
                //console.log("month:"+month);
                if (schedule.months.has(month))
                    for (; day <= daysInMonth(year, month); day++) {
                        //console.log("day:"+day);
                        if (schedule.daysOfMonth.has(day)) {
                            //console.log("dayW:"+day);
                            var dayOfWeek = new Date(Date.UTC(year, month+1, day, 0,0,0)).getUTCDay();
                            if (schedule.daysOfWeek.has(dayOfWeek)) {
                                for (; hour < 24; hour++) {
                                    //console.log("hour:"+hour);
                                    if (schedule.hours.has(hour)) {
                                        for (; minute < 60; minute++) {
                                            //console.log("minute:"+minute);
                                            if (schedule.minutes.has(minute)) {
                                                return new Date(Date.UTC(year, month-1, day, hour, minute, 0)).getTime();
                                            }
                                        }
                                    }
                                    minute = 0;
                                }
                            }
                        }
                        hour = 0;
                        minute = 0;
                    }
                day = 1;
                hour = 0;
                minute = 0;
            }
        month = 1;
        day = 1;
        hour = 0;
        minute = 0;
    }
    return null;
};

Scheduler.prototype.addJobToRunQueue = function(job)
{
    var time = this.getNextSchedule(new Date(), job.schedule),
        n    = array.bisectLeft(this.queue.times, time);

    this.queue.times.splice(n, 0, time);
    this.queue.jobs.splice(n, 0, job);
};

Scheduler.prototype.addJobToRunQueue = function(job)
{
    var time = this.getNextSchedule(new Date(), job.schedule),
        n    = array.bisectLeft(this.queue.times, time);

    this.queue.times.splice(n, 0, time);
    this.queue.jobs.splice(n, 0, job);
    job.scheduleTime = time;
};

Scheduler.prototype.removeJobFromRunQueue = function(job)
{
    var n = array.bisectLeft(this.queue.jobs, job);

    console.log(n);
    this.queue.times.splice(n, 1);
    this.queue.jobs.splice(n, 1);
    job.scheduleTime = null;
};

Scheduler.prototype.registerCronJob = function(expression, handler, args, kwargs)
{
    var job = new Job();

    cronExpression.parse(expression, function(error, element) {
        if (error) {
            console.log("!!ERROR!!");
            console.log(error);
            return;
        }
        //console.log("New element: "+element.name);
        //console.log(element); 
        job.schedule[element.name] = element;
    });

    job.$id = jazutil.newId();

    this.jobs[job.$id] = job;

    this.addJobToRunQueue(job);
};

Scheduler.prototype.runRightJobs = function()
{
    var now = (new Date()).getTime(),
        bound = array.bisectLeft(this.queue, now);

    for (var i=0; i<bound; i++) {
        var job = this.queue[i];
        job.run();
        this.addJobToRunQueue(job);
    }
    var seconds = 60 - (new Date()).getSeconds();
    setTimeout(this.runRightJobs, 1000*seconds);
};

Scheduler.prototype.run = function()
{
    setTimeout(this.runRightJobs, 0);
};

