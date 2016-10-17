var assert = require('chai').assert;
var Fixo = require('../lib/fixo');

describe('@fixo-resolvers', function () {
    var fixo;

    describe('@default', function () {
        before(function () {
            fixo = new Fixo();
        });

        it('should return a resolver', function () {
            assert.isFunction(fixo.getResolver('include'));
        });

        it('should return default resolvers', function () {
            assert.isObject(fixo.resolvers());
            assert.deepEqual(Object.keys(fixo.resolvers()), ['include', 'get']);
        });

        it('should add a new resolver', function () {
            var testResolver = function () {};
            fixo.addResolver('test', testResolver);
            assert.equal(testResolver, fixo.getResolver('test'));
        });

        it('should remove a resolver', function () {
            var testResolver = function () {};
            fixo.addResolver('test', testResolver);
            assert.isFunction(fixo.getResolver('test'));

            fixo.removeResolver('test');
            assert.isUndefined(fixo.getResolver('test'));
        });

        it('should throw an error for invalid resolver name', function () {
            assert.throws(function () {
                fixo.addResolver('test-invalid', function () {});
            }, TypeError, /Resolver name/);
        });
    });

    describe('@custom-resolver', function () {
        before(function () {
            fixo = new Fixo({
                srcDir: 'test/fixture'
            });

            fixo.addResolver('custom', function (props, callback) {
                var result = {};
                Object.keys(props).forEach(function (key) {
                    result[key] = props[key].value + ' custom';
                });

                if (callback) {
                    setTimeout(function () {
                        callback(null, result);
                    }, 0);
                } else {
                    return result;
                }
            });
        });

        it('@load should process custom resolver', function (done) {
            fixo.load('profile').then(function (object) {
                assert.equal(object.name, 'Walter Mitty');
                assert.equal(object.custom, 'hello custom');
                assert.equal(object.address.custom, 'address custom');
                done();
            });
        });

        it('@loadSync should process custom resolver', function () {
            var object = fixo.loadSync('profile');
            assert.equal(object.name, 'Walter Mitty');
            assert.equal(object.custom, 'hello custom');
            assert.equal(object.address.custom, 'address custom');
        });
    });
});
