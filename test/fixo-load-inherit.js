'use strict';

var assert = require('chai').assert;
var Fixo = require('../index');

describe('@fixo-load-inherit: Ineritance and Override', function () {
    var fixo;

    before(function () {
        fixo = new Fixo({
            srcDir: 'test/fixture'
        });
    });

    describe('@load: fixo#load', function () {
        it('should return an object from master profile', function (done) {
            fixo.load('card').then(function (card) {
                assert.isDefined(card);
                assert.isDefined(card.visa);
                assert.equal(card.visa.account_number, '4213423432432234');
                assert.isDefined(card.amex);
                assert.isUndefined(card.GB);
                done();
            }).catch(done);
        });

        it('should return an object for the given profile, which inherit ' +
            'from master',
            function (done) {
                fixo.load('card', 'GB').then(function (card) {
                    assert.isDefined(card);
                    assert.isDefined(card.visa);
                    assert.equal(card.visa.account_number, '0000000000000000');
                    assert.deepEqual(card.visa.issuer_bank, {
                        name: 'Standard Chartered',
                        country: 'GB'
                    });
                    assert.isUndefined(card.master);
                    assert.isUndefined(card['GB-en']);
                    done();
                }).catch(done);
            }
        );

        it('should return an object from the default profile', function (done) {
            fixo.setOptions({
                defaultProfile: 'GB'
            });

            fixo.load('card', 'GB').then(function (card) {
                assert.equal(card.visa.account_number, '0000000000000000');
                assert.deepEqual(card.visa.issuer_bank, {
                    name: 'Standard Chartered',
                    country: 'GB'
                });
                done();
            }).catch(done).finally(function () {
                fixo.setOptions({
                    defaultProfile: 'master'
                });
            });
        });

        it('should return a fixture profile which inherits from GB and en', function (done) {
            fixo.load('card', 'GB-en').then(function (card) {
                assert.equal(card.visa.account_number, '1111111111111111');
                assert.deepEqual(card.visa.issuer_bank, {
                    name: 'Standard Chartered',
                    country: 'GB'
                });
                assert.equal(card.visa.en_default, 'en default');
                assert.equal(card.visa.en_visa, 'en visa');
                assert.equal(card.amex.en_default, 'en default');
                assert.isUndefined(card.amex.en_visa);
                done();
            }).catch(done);
        });

        it('should return an object which inherits from GB, en, and GB-en profiles',
            function (done) {
                fixo.load('card', 'GB-en-dev').then(function (card) {
                    assert.equal(card.visa.account_number, '2222222222222222');
                    assert.deepEqual(card.visa.issuer_bank, {
                        name: 'Standard Chartered',
                        country: 'GB'
                    });
                    assert.equal(card.visa.en_default, 'en default');
                    assert.equal(card.visa.gb_en_default, 'gb en default');
                    assert.equal(card.visa.en_visa, 'en visa');
                    assert.equal(card.visa.gb_en_visa, 'gb en visa');
                    assert.equal(card.amex.en_default, 'en default');
                    assert.equal(card.amex.gb_en_default, 'gb en default');
                    assert.isUndefined(card.amex.en_visa);
                    assert.isUndefined(card.amex.gb_en_visa);
                    done();
                }).catch(done);
            });

        it('should return master data for an unknown profile', function (done) {
            fixo.load('card', 'profile-x').then(function (card) {
                assert.isDefined(card);
                done();
            }).catch(done);
        });

        it('should return the fixture for an unknown profile without master defintion',
            function (done) {
                fixo.load('profile', 'profile-x').then(function (profile) {
                    assert.isDefined(profile);
                    assert.equal(profile.name, 'Walter Mitty');
                    done();
                }).catch(done);
            });
    });

    describe('@loadSync: fixo#loadSync', function () {
        it('should return an object from master profile', function () {
            var card = fixo.loadSync('card');
            assert.isDefined(card);
            assert.isDefined(card.visa);
            assert.equal(card.visa.account_number, '4213423432432234');
            assert.isDefined(card.amex);
            assert.isUndefined(card.GB);
        });

        it('should return an object for the given profile, which inherit ' +
            'from master',
            function () {
                var card = fixo.loadSync('card', 'GB');
                assert.isDefined(card);
                assert.isDefined(card.visa);
                assert.equal(card.visa.account_number, '0000000000000000');
                assert.deepEqual(card.visa.issuer_bank, {
                    name: 'Standard Chartered',
                    country: 'GB'
                });
                assert.isUndefined(card.master);
                assert.isUndefined(card['GB-en']);
            }
        );

        it('should return an object from the default profile', function () {
            fixo.setOptions({
                defaultProfile: 'GB'
            });

            try {
                var card = fixo.loadSync('card', 'GB');
                assert.equal(card.visa.account_number, '0000000000000000');
                assert.deepEqual(card.visa.issuer_bank, {
                    name: 'Standard Chartered',
                    country: 'GB'
                });
            } finally {
                fixo.setOptions({
                    defaultProfile: 'master'
                });
            }
        });

        it('should return a fixture profile which inherits from GB and en profiles', function () {
            var card = fixo.loadSync('card', 'GB-en');
            assert.equal(card.visa.account_number, '1111111111111111');
            assert.deepEqual(card.visa.issuer_bank, {
                name: 'Standard Chartered',
                country: 'GB'
            });
            assert.equal(card.visa.en_default, 'en default');
            assert.equal(card.visa.en_visa, 'en visa');
            assert.equal(card.amex.en_default, 'en default');
            assert.isUndefined(card.amex.en_visa);
        });

        it('should return an object which inherits from GB, en and GB-en profiles', function () {
            var card = fixo.loadSync('card', 'GB-en-dev');
            assert.equal(card.visa.account_number, '2222222222222222');
            assert.deepEqual(card.visa.issuer_bank, {
                name: 'Standard Chartered',
                country: 'GB'
            });
            assert.equal(card.visa.en_default, 'en default');
            assert.equal(card.visa.gb_en_default, 'gb en default');
            assert.equal(card.visa.en_visa, 'en visa');
            assert.equal(card.visa.gb_en_visa, 'gb en visa');
            assert.equal(card.amex.en_default, 'en default');
            assert.equal(card.amex.gb_en_default, 'gb en default');
            assert.isUndefined(card.amex.en_visa);
            assert.isUndefined(card.amex.gb_en_visa);
        });

        it('should return master data for an unknown profile', function () {
            var card = fixo.loadSync('card', 'profile-x');
            assert.isDefined(card);
        });

        it('should return the fixture for an unknown profile without master defintion',
            function () {
                var profile = fixo.loadSync('profile', 'profile-x');
                assert.isDefined(profile);
                assert.equal(profile.name, 'Walter Mitty');
            }
        );
    });
});
