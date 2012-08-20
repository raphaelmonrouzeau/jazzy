var assert         = require("assert")
  , CronExpression = require("../CronExpression");

describe("CronExpression", function() {
    describe("#parse()", function() {
        it("should return full ranges for stars", function() {
            var cronExpression = new CronExpression()
              , elementTester = function(error, element) {
                    var exp = {};
                    if (element.name === "minutes")
                        for (var i=0; i<60; i++) exp[i] = true;
                    if (element.name === "hours")
                        for (var i=0; i<24; i++) exp[i] = true;
                    if (element.name === "daysOfMonth")
                        for (var i=1; i<32; i++) exp[i] = true;
                    if (element.name === "months")
                        for (var i=1; i<13; i++) exp[i] = true;
                    if (element.name === "daysOfWeek")
                        for (var i=0; i<7; i++) exp[i] = true;
                    if (element.name === "years")
                        for (var i=1970; i<2100; i++) exp[i] = true;
                    if (!Object.keys(exp).length) 
                        throw new Error("Unknown element type: "+element.name);
                    assert.deepEqual(element.discreteValues, exp);
                };
            cronExpression.parse("* * * * * *", elementTester);
        });
        it("should fill missing fields with stars", function() {
            var cronExpression = new CronExpression()
              , elementTester = function(error, element) {
                    var exp = {};
                    if (element.name === "minutes")
                        for (var i=0; i<60; i++) exp[i] = true;
                    if (element.name === "hours")
                        for (var i=0; i<24; i++) exp[i] = true;
                    if (element.name === "daysOfMonth")
                        for (var i=1; i<32; i++) exp[i] = true;
                    if (element.name === "months")
                        for (var i=1; i<13; i++) exp[i] = true;
                    if (element.name === "daysOfWeek")
                        for (var i=0; i<7; i++) exp[i] = true;
                    if (element.name === "years")
                        for (var i=1970; i<2100; i++) exp[i] = true;
                    if (!Object.keys(exp).length) 
                        throw new Error("Unknown element type: "+element.name);
                    assert.deepEqual(element.discreteValues, exp);
                };
            cronExpression.parse("", elementTester);
        });
        it("should understand increment on stars", function() {
            var cronExpression = new CronExpression()
              , elementTester = function(error, element) {
                    var exp = {};
                    if (element.name === "minutes")
                        for (var i=0; i<60; i++) exp[i] = true;
                    if (element.name === "hours")
                        for (var i=0; i<24; i+=2) exp[i] = true;
                    if (element.name === "daysOfMonth")
                        for (var i=1; i<32; i+=3) exp[i] = true;
                    if (element.name === "months")
                        for (var i=1; i<13; i+=4) exp[i] = true;
                    if (element.name === "daysOfWeek")
                        for (var i=0; i<7; i+=5) exp[i] = true;
                    if (element.name === "years")
                        for (var i=1970; i<2100; i+=6) exp[i] = true;
                    if (!Object.keys(exp).length) 
                        throw new Error("Unknown element type: "+element.name);
                    assert.deepEqual(element.discreteValues, exp);
                };
            cronExpression.parse("*/1 */2 */3 */4 */5 */6", elementTester);
        });
    });
});

//testCase("* * * *");
//testCase("*/5 * * *");
//testCase("*/3 * 31 * *");

