'use strict';

var assert = require('chai').assert;
var Fixo = require('../index');

describe('@fixo-load-macros: Macros', function () {
    var fixo;

    before(function () {
        fixo = new Fixo({
            srcDir: 'test/fixture'
        });
    });

    ['load', 'loadSync'].forEach(function (method) {
        describe('@' + method + ' fixo#' + method, function () {
            var fixture;

            before(function (done) {
                if (method === 'load') {
                    fixo.load('macros').then(function (fixMacros) {
                        fixture = fixMacros;
                        done();
                    });
                } else {
                    fixture = fixo.loadSync('macros');
                    done();
                }
            });

            it('should resolve macro', function () {
                assert.match(fixture.single, /^\w{12}$/);
            });

            it('should resolve multiple macros', function () {
                assert.match(fixture.multiple, /^pre-\w{12}-\w{12}-post$/);
            });

            it('should accept arguments', function () {
                assert.match(fixture.numeric, /^\d{12}$/);
                assert.match(fixture.numeric_5, /^\d{5}$/);
            });

            it('should ignore unknown macro', function () {
                assert.equal(fixture.unknown, '{unknown}');
            });
        });
    });
});

