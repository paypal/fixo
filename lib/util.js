'use strict';

var debug = require('debug')('fixo:util');
var _ = require('lodash');
var Util = {};

Util.groupFieldNamesAndValuesByProfile = function (props, profile) {
    var values = {};
    var fieldNames = {};

    if (!props) {
        return {};
    }

    _.forEach(props, function (ref, field) {
        var refProfile = ref.profile || profile;
        var refValue = ref.value;

        if (!values[refProfile]) {
            values[refProfile] = [];
            fieldNames[refProfile] = [];
        }

        values[refProfile].push(refValue);
        fieldNames[refProfile].push(field);
    });

    debug('groupFieldNamesAndValuesByProfile() - values:', values, ', fieldNames:', fieldNames);

    return {
        fieldNames: fieldNames,
        values: values
    };
};

module.exports = Util;
