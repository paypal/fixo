'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru();

describe('@loader-cache', function () {
    describe('@load', function () {
        var loader;
        var readCount = 0;

        before(function () {
            var Loader = proxyquire('../lib/loader', {
                fs: {
                    readFile: function (file, encoding, callback) {
                        readCount++;
                        callback(null, '{ "mock": "profile"}');
                    }
                }
            });
            loader = new Loader();
        });

        it('should load fixture file from cache', function (done) {
            loader.load('profile', 'master').then(function (profile) {
                return profile;
            }).then(function (profile1) {
                loader.load('profile').then(function (profile2) {
                    assert.equal(profile1.mock, 'profile');
                    assert.equal(profile2.mock, 'profile');
                    assert.equal(1, readCount);
                    done();
                });
            });
        });
    });

    describe('@loadSync', function () {
        var loader;
        var readCount = 0;

        before(function () {
            var Loader = proxyquire('../lib/loader', {
                fs: {
                    readFileSync: function () {
                        readCount++;
                        return '{ "mock": "profile"}';
                    }
                }
            });
            loader = new Loader();
        });

        it('should load fixture file from cache', function () {
            var profile1 = loader.loadSync('profile', 'master');
            var profile2 = loader.loadSync('profile');
            assert.equal(profile1.mock, 'profile');
            assert.equal(profile2.mock, 'profile');
            assert.equal(1, readCount);
        });
    });
});
