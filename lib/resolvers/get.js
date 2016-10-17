'use strict';

var Promise = require('bluebird');
var _ = require('lodash');
var util = require('../util');
var debug = require('debug')('fixo:resolver:get');

var PROFILE_MASTER = 'master';

function resolveValues(values, fields, rootObject) {
    var result = {};

    _.forEach(values, function (value, index) {
        var field = fields[index];
        var resolvedValue = _.get(rootObject, value);

        result[field] = resolvedValue;

        debug('resolveValues() - field:', field, ', value:', value,
            ', resolvedValue:', resolvedValue, ', rootObject:', rootObject);
    });

    return result;
}

module.exports = function resolve(props, callback) {
    debug('resolve() - props:', props);

    var propGroups = util.groupFieldNamesAndValuesByProfile(props);
    var result = {};
    var resolves = [];

    var rootObject = this.rootObject;
    var filename = this.filename;

    _.forEach(propGroups.values, function (values, profile) {
        debug('resolve() - values:', values, ', profile:', profile);
        var fields = propGroups.fieldNames[profile];

        if (!profile || (profile === PROFILE_MASTER)) {
            _.assign(result, resolveValues(values, fields, rootObject));
        } else {
            if (callback) {
                resolves.push(this.loadObjects(filename, profile)
                    .then(function (refObjects) {
                        _.assign(result, resolveValues(values, fields, refObjects[0]));
                    }));
            } else {
                var refObjects = this.loadObjectsSync(filename, profile);
                _.assign(result, resolveValues(values, fields, refObjects[0]));
            }
        }
    }.bind(this));

    if (callback) {
        Promise.all(resolves).then(function () {
            debug('resolve() - result:', result);
            callback(null, result);
        }).catch(function (err) {
            debug('resolve() - err:', err);
            callback(err);
        });
    } else {
        return result;
    }
};
