'use strict';

var assert = require('chai').assert;
var Fixo = require('../lib/fixo');

describe('@fixo', function () {
    describe('setOptions', function () {
        var fixo;

        before(function () {
            fixo = new Fixo();
        });

        it('should return the default options', function () {
            var options = fixo.getOptions();

            assert.equal(options.srcDir, '.');
            assert.equal(options.defaultProfile, 'master');
        });

        it('should update options with setOptions method', function () {
            fixo.setOptions({
                srcDir: 'test/functional/fixture',
                defaultProfile: 'GB'
            });

            var options = fixo.getOptions();
            assert.equal(options.srcDir, 'test/functional/fixture');
            assert.equal(options.defaultProfile, 'GB');
        });
    });
});
