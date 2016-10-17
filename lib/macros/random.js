'use strict';

var RANDOM_TYPE_ALPHANUM = 'alphanum';
var RANDOM_TYPE_NUMERIC = 'numeric';
var RANDOM_TYPE_ALPHA = 'alpha';

function random(type, length) {
    type = type || RANDOM_TYPE_ALPHANUM;
    length = length || 12;

    if (length > 50) {
        length = 50;
    }

    var alphaSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var numericSet = '0123456789';
    var charSet;

    switch (type) {
        case RANDOM_TYPE_ALPHA:
            charSet = alphaSet;
            break;
        case RANDOM_TYPE_NUMERIC:
            charSet = numericSet;
            break;
        case RANDOM_TYPE_ALPHANUM:
            charSet = alphaSet + numericSet;
            break;
        default:
            throw new TypeError('Unknown random type:' + type);
    }

    var text = '';
    for (var i = 0; i < length; i++) {
        text += charSet.charAt(Math.floor(Math.random() * charSet.length));
    }

    return text;
}

module.exports = random;
