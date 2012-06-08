var fs      = require('fs');
var path    = require('path');
var jazutil = require('./util');

var defaults = {
    main: {
        base: undefined
    }
};

function normalize(base, conf)
{
    defaults.main.base = base;

    jazutil.setdefaults(conf, defaults);
    return conf;
}

function load(data)
{
    if (typeof data === 'object') {
        return normalize(process.cwd(), data);
    }

    var config_file_content = fs.readFileSync(data);
    try {
        var config_file_data = JSON.parse(config_file_content);
    } catch (e) {
        console.log("Unable to parse config file "+data);
        console.log(e);
        throw e;
    }
    return normalize(process.cwd(), config_file_data);
}

exports.load        = load;
