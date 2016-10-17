'use strict';

var assert = require('chai').assert;
var Fixo = require('../index');

describe('@fixo-load-main: Main features', function () {
    var fixo;

    before(function () {
        fixo = new Fixo({
            srcDir: 'test/fixture'
        });
    });

    describe('@load: fixo#load', function () {
        it('should load a fixture as promise', function (done) {
            fixo.load('profile').then(function (profile) {
                assert.isDefined(profile);
                assert.equal(profile.name, 'Walter Mitty');
                assert.isObject(profile.address, 'address');
                done();
            }).catch(done);
        });

        it('should load a fixture with a callback', function (done) {
            fixo.load('profile', function (err, profile) {
                if (err) {
                    done(err);
                }

                assert.isDefined(profile);
                assert.equal(profile.name, 'Walter Mitty');
                assert.isObject(profile.address, 'address');
                assert.equal(profile.address.line_1, 'Big Data Inc');
                done();
            });
        });

        it('should load a fixture from another profile with a callback', function (done) {
            fixo.load('card', 'GB', function (err, card) {
                if (err) {
                    done(err);
                }

                assert.isDefined(card);
                assert.equal(card.visa.profile, 'GB');
                done();
            });
        });

        it('should load multiple fixtures', function (done) {
            fixo.load(['profile', 'card']).then(function (fixtures) {
                assert.isArray(fixtures);
                assert.isDefined(fixtures[0]);
                assert.isDefined(fixtures[0].name, 'Walter Mitty');

                assert.isDefined(fixtures[1]);
                done();
            }).catch(done);
        });

        it('should return an array if a single element fixture name array is passed',
            function (done) {
                fixo.load(['profile']).then(function (fixtures) {
                    assert.isArray(fixtures);
                    assert.equal(1, fixtures.length);
                    assert.isDefined(fixtures[0].name, 'Walter Mitty');
                    done();
                }).catch();
            }
        );

        it('should load a fixture property', function (done) {
            fixo.load('profile.address').then(function (address) {
                assert.isDefined(address);
                assert.equal(address.line_1, 'Big Data Inc');
                done();
            }).catch(done);
        });

        it('should load multiple fixtures with property references', function (done) {
            fixo.load(['profile', 'profile.address', 'card.visa']).then(function (fixtures) {
                assert.isDefined(fixtures);
                assert.equal(fixtures.length, 3);
                assert.equal(fixtures[0].name, 'Walter Mitty');
                assert.equal(fixtures[1].line_1, 'Big Data Inc');
                assert.equal(fixtures[2].account_number, '4213423432432234');
                done();
            }).catch(done);
        });

        it('should load a fixture in a subfolder', function (done) {
            fixo.load('nested/bank').then(function (bank) {
                assert.isDefined(bank);
                assert.equal(bank.name, 'Standard Chartered');
                done();
            }).catch(done);
        });

        it('should load property of a fixture in a subfolder', function (done) {
            fixo.load('nested/bank.address').then(function (address) {
                assert.isDefined(address);
                assert.equal(address.line_1, 'Big Data Inc');
                done();
            }).catch(done);
        });

        it('should return undefined if an object property is not found', function (done) {
            fixo.load('profile.xyz').then(function (address) {
                assert.isUndefined(address);
                done();
            }).catch(done);
        });

        it('should throw an error if a fixture file is not found', function () {
            fixo.load('unknown_fixture').then(function () {
                assert.fail(undefined, undefined, 'Fixture not found error expected');
            }).catch(function (err) {
                assert.match(err.message, /ENOENT/);
            });
        });
    });

    describe('@loadSync: fixo#loadSync', function () {
        it('should load a fixture', function () {
            var profile = fixo.loadSync('profile');
            assert.isDefined(profile);
            assert.equal(profile.name, 'Walter Mitty');
            assert.isObject(profile.address, 'address');
            assert.equal(profile.address.line_1, 'Big Data Inc');
        });

        it('should load multiple fixtures', function () {
            var fixtures = fixo.loadSync(['profile', 'card']);
            assert.isArray(fixtures);
            assert.isDefined(fixtures[0]);
            assert.isDefined(fixtures[0].name, 'Walter Mitty');

            assert.isDefined(fixtures[1]);
        });

        it('should return an array if an array of a single fixture name is passed',
            function () {
                var fixtures = fixo.loadSync(['profile']);
                assert.isArray(fixtures);
                assert.equal(1, fixtures.length);
                assert.isDefined(fixtures[0].name, 'Walter Mitty');
            }
        );

        it('should load a fixture property', function () {
            var address = fixo.loadSync('profile.address');
            assert.isDefined(address);
            assert.equal(address.line_1, 'Big Data Inc');
        });

        it('should load multiple fixtures with property references', function () {
            var fixtures = fixo.loadSync(['profile', 'profile.address', 'card.visa']);
            assert.isDefined(fixtures);
            assert.equal(fixtures.length, 3);
            assert.equal(fixtures[0].name, 'Walter Mitty');
            assert.equal(fixtures[1].line_1, 'Big Data Inc');
            assert.equal(fixtures[2].account_number, '4213423432432234');
        });

        it('should load a fixture in a subfolder', function () {
            var bank = fixo.loadSync('nested/bank');
            assert.isDefined(bank);
            assert.equal(bank.name, 'Standard Chartered');
        });

        it('should load property of a fixture object in a subfolder', function () {
            var address = fixo.loadSync('nested/bank.address');
            assert.isDefined(address);
            assert.equal(address.line_1, 'Big Data Inc');
        });

        it('should return undefined if an object property is not found', function () {
            var xyz = fixo.loadSync('profile.xyz');
            assert.isUndefined(xyz);
        });

        it('should throw an error if a fixture file is not found', function () {
            try {
                fixo.loadSync('unknown_fixture');
                assert.fail(undefined, undefined, 'Fixture not found error expected');
            } catch (err) {
                assert.match(err.message, /ENOENT/);
            }
        });
    });
});
