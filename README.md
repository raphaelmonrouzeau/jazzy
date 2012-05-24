jazzy - a web framework that makes your apps swing
==================================================

Disclaimer: Jazzy is in early beta stage, documentation is non-existent, you
want to look at other, more popular choices like connect.


Jazzy aims to be more of a modular then functional web framework than an object
oriented one.

The jazzy module provides a server, a router and a config loader. Best is
probably to give an example.

## Usage

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

## Philosophy

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

