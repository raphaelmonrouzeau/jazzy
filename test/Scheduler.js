var assert      = require("assert")
  , Scheduler   = require("../Scheduler");

describe("Scheduler", function() {
    describe("#registerCronJob()", function() {
        it("should return the id of a new job whose schedule corresponds to parsed cron expression", function() {
            var scheduler = new Scheduler()
              , jobId     = scheduler.registerCronJob("* * * *", function(){console.log(arguments);});
            ;
        });
    });
});

//testCase("* * * *");
//testCase("*/5 * * *");
//testCase("*/3 * 31 * *");
