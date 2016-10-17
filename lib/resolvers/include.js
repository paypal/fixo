'use strict';

var Promise = require('bluebird');
var _ = require('lodash');
var util = require('../util');
var debug = require('debug')('fixo:resolver:include');

function resolveValues(values, fieldsGroup, profile) {
    var result = {};
    var fields = fieldsGroup[profile];

    values.forEach(function (value, index) {
        var field = fields[index];

        // Object reference could be from another profile, e.g. fix.GB:card.visa.
        // Temporary profile tag so that nested values could be resolved with the same
        // profile
        if (value && (typeof value === 'object')) {
            value._resolved_profile = profile;
        }

        result[field] = value;
        debug('resolveValues() - field: ' + field + ', value:', value);
    });

    return result;
}

/**
 * Resolve object reference from another file, example:
 *  include:[filename(.prop)]
 *  include.[profile]:[filename(.prop)]
 *
 * @param {object} props properties to be resolved, i.e.
 *      {[field_name]: { value: [value], profile: [profile]}
 * @returns {object} Optional, only required for sync implementation,
 *      when callback is not passed
 */
module.exports = function resolve(props, callback) {
    debug('resolve() - props', props);

    var propGroups = util.groupFieldNamesAndValuesByProfile(props);
    var result = {};
    var resolves = [];

    _.forEach(propGroups.values, function (values, profile) {
        debug('_resolve() - values', values, ', profile:', profile);

        if (callback) {
            resolves.push(this.loadObjects(values, profile)
                .then(function (objects) {
                    _.assign(result, resolveValues(objects, propGroups.fieldNames, profile));
                }));
        } else {
            var objects = this.loadObjectsSync(values, profile);
            _.assign(result, resolveValues(objects, propGroups.fieldNames, profile));
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
