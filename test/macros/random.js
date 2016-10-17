'use strict';

var assert = require('chai').assert;
var random = require('../../lib/macros/random');

describe('@macros @random', function () {
    it('should generate random alphanumeric by default', function () {
        var text = random();
        assert.match(text, /^\w{12}$/);
    });

    it('should generate random alphabets', function () {
        var text = random('alpha');
        assert.match(text, /^[A-Za-z]{12}$/);
    });

    it('should generate random numeric', function () {
        var text = random('numeric');
        assert.match(text, /^\d{12}$/);
    });

    it('should generate random alphanumeric', function () {
        var text = random('alphanum');
        assert.match(text, /^\w{12}$/);
    });

    it('should accept length argument', function () {
        var text = random('alphanum', 15);
        assert.match(text, /^\w{15}$/);
    });
});
