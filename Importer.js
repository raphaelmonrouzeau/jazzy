var util    = require("util")
  , events  = require("events");

/** Manages an import process.
 *
 * The importer depends upon an update manager (an updater). It monitores and
 * reports start and end of updates and can log them, wrap them...
 *
 * Think to it as the import task, usually where error handling will take
 * place.
 */

var Importer = exports = module.exports = function(name, updater)
{
    this.name       = name;
    this.updater    = updater;
    events.EventEmitter.call(this);
};
util.inherits(Importer, events.EventEmitter);

var util    = require("util")
    Mutexes = require("./models/Mutexes");

Importer.prototype.getMutexName = function(name)
{
    return util.format("import.%s.lock", name);
};

Importer.prototype.beginImport = function(cb)
{
    var self = this;

    this.acquireLock(function(err) {
        if (err)
            return cb(err);
        self.recordImport(function(err) {
            if (err)
                return self.releaseLock(function(e) {
                    cb(err);
                });
            cb(null);
        });
    });
};

Importer.prototype.acquireLock = function(cb)
{
    //cb(null);
    var self = this;
    Mutexes.acquire(this.getMutexName(this.name), cb);
};

Importer.prototype.recordImport = function(cb)
{
    this.$id = 0;
    cb(null);
    // store in mongo collection, with date and serial number, store id in this.id
};

Importer.prototype.recordImportEnd = function(name, message, cb)
{
    cb(null);
    // locate import in mongo collection, register date , reason, ...
};

Importer.prototype.releaseLock = function(cb)
{
    //cb(null);
    Mutexes.release(this.getMutexName(this.name), cb);
};

Importer.prototype.endImport = function(name, message, cb)
{
    var self = this;

    this.recordImportEnd(name, message, function(err) {
        self.releaseLock(function(e) {
            if (err) return cb(err);
            cb(null);
        });
    });
};

Importer.prototype.run = function(options)
{
    var self        = this;
    
    this.beginImport(function(err) {
        if (err)
            return self.emit("error", err);

        self.updater.on("update", function(operation, record) {
            ;
        });

        self.updater.on("error", function(err) {
            self.emit("error", err);
            self.endImport(err.name, err.message, function(e) {});
        });

        self.updater.on("end", function() {
            self.emit("endOfData");

            self.endImport("success", "OK", function(e) {
                if (e)
                    return self.emit("error", e);
                self.emit("end");
            });
        });

        self.updater.run(self.parser, options);
    });
};
