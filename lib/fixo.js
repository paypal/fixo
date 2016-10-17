'use strict';

var _ = require('lodash');
var Loader = require('./loader');

var DEFAULT_SRC_DIR = '.';
var DEFAULT_PROFILE = 'master';

function Fixo(options) {
    if (!(this instanceof Fixo)) {
        return new Fixo(options);
    }

    this._options = {
        srcDir: DEFAULT_SRC_DIR,
        defaultProfile: DEFAULT_PROFILE
    };

    this.setOptions(options);
    this.loader = new Loader(this._options);
}

Fixo.prototype.getOptions = function () {
    return this._options;
};

Fixo.prototype.setOptions = function (options) {
    _.merge(this._options, options);
};

Fixo.prototype.load = function () {
    return this._load(arguments);
};

Fixo.prototype.loadSync = function () {
    return this._load(arguments, true);
};

// Proxy resolver and macro methods
['Macro', 'Resolver'].forEach(function (type) {
    ['get', 'add', 'remove', 'all'].forEach(function (action) {
        var methodName = action + type;
        if (action === 'all') {
            methodName = type.toLowerCase() + 's';
        }

        Fixo.prototype[methodName] = function () {
            return this.loader[methodName].apply(this.loader, arguments);
        };
    });
});

// Helper methods
Fixo.prototype._load = function (args, isSync) {
    var callback = args[args.length - 1];

    if (typeof callback === 'function') {
        args = Array.prototype.slice.call(args, 0, args.length - 1);
    } else {
        callback = undefined;
    }

    var filename = args[0];
    var profile = args[1];

    if (isSync) {
        return this.loader.loadSync(filename, profile);
    }

    return this.loader.load(filename, profile, callback);
};

module.exports = Fixo;
