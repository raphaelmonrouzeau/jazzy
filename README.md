jazzy - a web framework that makes your apps swing
==================================================

Disclaimer: Jazzy is in early beta stage, documentation is non-existent, you
want to look at other, more popular choices like express/connect.

## Logging

```js
    var logger = new Logger("/var/log/daemon/%Y/%m/%d.log");
        
    logger.mangler(function(log) {
        if (typeof log === "string")
            return { at: new Date(), ns: "socket.io", body: log }
        log.at = new Date();
        if (!log.hasOwnProperty('ns'))
            log.ns = 'unknown';
        return log;
    });
```

## Web applications

This is an example config file, you could put in you app's `etc/config.dev.json`:

```js
    { "server": {
          "http": { "port": 5000 },
          "https": { "port": 5001, "cert": "cert+key.pem" }
      },
      "router": {
          "routes": {
              "*": {
                  "pattern": "^/bootstrap$",
                  "module": "../src/bootstrap.js"
              },
              "web.site.com:5000": [
                  { "pattern": "^/$",
                    "module": "src/controllers/web_site_com/template.js" },
                  { "pattern": "^/(app.js|app.css|app.manifest)$",
                    "module": "src/controllers/web_site_com/pipeline.js" },
                  { "pattern": "^/(css/|img/|js/|favicon.ico$)",
                    "module": "src/controllers/web_site_com/static.js" },
                  {  "module": "src/controllers/web_site_com/error404.js" }
              ]
          } 
    } }
```

## Command-line applications

```js
    #!/usr/bin/env node
    // vim: filetype=javascript
    
    var CommandLineApp = require("jazzy/CommandLineApp");
    
    app = new CommandLineApp();
    app.addOption(
        "configFilePath", {
            abbr: "c", help: "Path to the config file", required: true,
            metavar: "CONFIG_FILE" },
        function(app, name, args, kwargs) {
            // test if path kwargs[name] exists
            // then add to app a property configContent
            // or something like that
        }
    );
    app.addCommand(
        "create", {
            help: "Creates a new client"
        }, function(app, cmd, args, kwargs) {
            console.log("create");
            console.log(arguments);
        }
    );
    app.addLastCommandOption(
        "input", { abbr: "i", metavar: "INPUT", help: "Use INPUT as input", required: true },
        function(app, name, args, kwargs) {
            console.log("input flag");
            console.log(arguments);
        }
    );
    app.addCommand(
        "update", {
            help: "Updates a client"
        }, function(app, cmd, args, kwargs) {
            console.log("update");
            console.log(arguments);
        }
    );
    app.addCommand(
        "delete", {
            help: "Deletes a client"
        }, function(app, cmd, args, kwargs) {
            console.log("delete");
            console.log(arguments);
        }
    );
    
    app.run();
```

## Object validation schemas

```js
    var Schema      = require('jazzy/schema'),
        validators  = require('jazzy/validators');
    
    var schema = new Schema({
        timestamp: function(v) { 
            return validators.validateDateFromString(v);
        },
        nonce: function(v) {
            return validators.validateNumberFromString(v);
        },
        digest: function(v) {
            return validators.validateHexString(v, {minLen:64,maxLen:64});
        }
    }).allowUselessFields(true);
    
    var onGetEnd = exports.onGetEnd = function(request, response)
    {
        schema.validate(request.kwargs, function(errors, params) {
            var responseParams = {
            };
            if (errors.length) {
                var error = errors.pop();
                responseParams.fieldProblem = error[0];
                responseParams.fieldName    = error[1];
                response.redirect(307, getUrl("http://example.com/error", responseParams));
                return;
            }
            responseParams.OK   = '1';
            response.redirect(307, getUrl("http://example.com/success", responseParams));
        });
    }
```

## Goals

Jazzy tries to trick you into writing more code inside modules, where they can
be read and parsed at launch time, less dynamically. This is *not* for
performance reasons but in an attempt to catch bugs at the earliest possible
stage.

Jazzy puts more emphasis on modules or functions than objects.

## LICENSE - "BSD License"

Copyright (c) 2012, Raphaël Monrouzeau <raphael.monrouzeau@gmail.com>
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright
    notice, this list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.
  * Neither the name of the authors, contributors or copyright holders
    may be used to endorse or promote products derived from this software
    without specific prior written permission.

THIS SOFTWARE IS PROVIDED "AS IS" AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
