var path            = require("path")
  , nodemailer      = require("nodemailer")
  , emailTemplates  = require("email-templates");

var BaseMailer = exports = module.exports = function(name, options)
{
    options = options || {};

    this.templatesOpenTag   = options.templatesOpenTag || "{{";
    this.templatesCloseTag  = options.templatesCloseTag || "}}";
    this.templatesDir       = options.templatesDir || path.join(__dirname, "templates");
    this.templatesSubdir    = name;

    this.transportName      = options.transportName || "SMTP";
    this.transportOptions   = {};
    if (options.transportService)
        this.transportOptions.service = options.transportService;
    if (options.transportAuth)
        this.transportOptions.auth = options.transportAuth;
    if (options.transportHost)
        this.transportOptions.host = options.transportHost;
    if (options.transportPort)
        this.transportOptions.port = options.transportPort;
    if (options.transportSecure)
        this.transportOptions.secureConnection = options.transportSecure;
    if (options.transportAdvertName)
        this.transportOptions.name = options.transportAdvertName;
    if (options.transportDebug)
        this.transportOptions.debug = options.transportDebug;
    if (options.transportMaxConnections)
        this.transportOptions.maxConnections = options.transportMaxConnections;

    var transport = this.transport =
      nodemailer.createTransport(this.transportName, this.transportOptions);
};

BaseMailer.prototype.getEmail = function(locals, cb)
{
    var self = this
      , options = { open: this.templatesOpenTag,
                    close: this.templatesCloseTag };

    emailTemplates(this.templatesDir, options, function(err, template) {
        if (err)
            return cb(err);
        template(self.templatesSubdir, locals, function(err, html, text) {
            if (err)
                return cb(err);
            cb(null, html, text);
        });
    });
};

BaseMailer.prototype.sendEmail = function(from, to, subject, html, text, cb)
{
    this.transport.sendMail({
        from:    from,
        to:      to,
        subject: subject,
        html:    html,
        text:    text
    }, function(err, responseStatus) {
        if (err) return cb(err);
        cb(null, responseStatus);
    });
};

BaseMailer.prototype.getParams = function(data, cb)
{
    cb(null, data);
};

BaseMailer.prototype.email = function(from, to, subject, data, cb)
{
    var self = this;

    this.getParams(data, function(err, params) {
        if (err)
            return cb(err);
        self.getEmail(params, function(err, html, text) {
            if (err)
                return cb(err);
            self.sendEmail(from, to, subject, html, text, function(err, responseStatus) {
                if (err)
                    return cb(err);
                cb(responseStatus);
            });
        });
    });
};
