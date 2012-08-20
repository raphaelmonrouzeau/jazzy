var fs       = require("fs"),
    path     = require("path"),
    strftime = require("strftime"),
    mkdirp   = require("mkdirp"),
    carrier  = require("carrier");

var Logger = exports = module.exports = function(pathPattern)
{
    this.pathPattern = pathPattern;
    this.currentPath = null;
    this.currentStream = null;
    this.eventHandlers = { error: function(err){} };
};

Logger.prototype.on = function(eventName, callback)
{
    this.eventHandlers[eventName] = callback;
    return this;
};

Logger.prototype.createStream = function(filePath)
{
    var stream = fs.createWriteStream(filePath, {flags:"a",mode:0640});
    Object.keys(this.eventHandlers).forEach(function(name) {
        stream.on(name, this.eventHandlers[name]);
    }, this);
    if (this.currentStream)
        this.currentStream.end();
    this.currentStream = stream;
    this.currentPath = path;
    return stream;
};

Logger.prototype.getReadStream = function(dateTime)
{
    var filePath = strftime(this.pathPattern, dateTime);
    return fs.createReadStream(filePath, {mode:0640});
};

Logger.prototype.getLineReadStream = function(dateTime)
{
    var fileCarrier = carrier.carry(this.getReadStream(dateTime));
    return fileCarrier;
};

var RecordReader = function(fileCarrier)
{
    var self = this;
    this.fileCarrier = fileCarrier;
    fileCarrier.on("line", function(line) {
        self.onLine(line);
        var record = JSON.parse(line);
        self.onRecord(record);
    });
};

RecordReader.prototype.onLine = function(line)
{
    ;
};

RecordReader.prototype.onRecord = function(record)
{
    ;
};

RecordReader.prototype.on = function(eventName, callback)
{
    if (eventName === "line") {
        this.onLine = callback;
        return; 
    }
    if (eventName === "record") {
        this.onRecord = callback;
        return;
    }
    return this.fileCarrier.on(eventName, callback);
};

Logger.prototype.getRecordReadStream = function(dateTime)
{
    return new RecordReader(this.getLineReadStream(dateTime));
};

Logger.prototype.getWriteStream = function(callback, dateTime)
{
    var filePath = strftime(this.pathPattern, dateTime);
    if (filePath === this.currentPath)
        return this.currentStream;

    var self = this;
    mkdirp(path.dirname(filePath), undefined, function(err, dir) {
        if (err) {
            self.eventHandlers["error"](err);
            return;
        }
        callback(self.createStream(filePath));
    });
};

Logger.prototype.getWriteStreamSync = function(dateTime)
{
    var filePath = strftime(this.pathPattern, dateTime);
    if (filePath === this.currentPath)
        return this.currentStream;

    mkdirp.sync(path.dirname(filePath));
    return this.createStream(filePath);
};

Logger.prototype.end = function()
{
    if (this.currentStream) ;
};

Logger.prototype.mangle = function(obj)
{
    return obj;
};

Logger.prototype.mangler = function(mangler)
{
    this.mangle = mangler;
    return this;
};

Logger.prototype.log = function(obj, dateTime)
{
    obj = this.mangle(obj);
    var stream = this.getWriteStreamSync(dateTime);
    var r = stream.write(JSON.stringify(obj)+"\n");
    return;
    this.getStream(strftime(this.pathPattern), function(stream) {
        var r = stream.write(JSON.stringify(obj));
    });
};

Logger.prototype.logWithSeverity = function(severity, obj)
{
    obj.at = (new Date()).toJSON();
    obj.severity = severity;
    this.log(obj);
};

Logger.prototype.debug = function(obj)
{
    this.logWithSeverity("DEBUG", obj);
};

Logger.prototype.trace = function(obj)
{
    this.logWithSeverity("TRACE", obj);
};

Logger.prototype.info = function(obj)
{
    this.logWithSeverity("INFO", obj);
};

Logger.prototype.warn = function(obj)
{
    this.logWithSeverity("WARN", obj);
};

Logger.prototype.error = function(obj)
{
    this.logWithSeverity("ERROR", obj);
};

Logger.prototype.crit = function(obj)
{
    this.logWithSeverity("CRIT", obj);
};
