'use strict';

var assert = require('chai').assert;
var Fixo = require('../index');

describe('@fixo-load-default: Extend default values', function () {
    var fixo;

    before(function () {
        fixo = new Fixo({
            srcDir: 'test/fixture'
        });
    });

    describe('@load: fixo#load', function () {
        describe('With master profile', function () {
            it('should extend the default values for each property', function (done) {
                fixo.load('card').then(function (card) {
                    assert.isUndefined(card.default);

                    assert.equal(card.visa.expiry_date, '08/18');
                    assert.equal(card.visa.cvv, '123');

                    assert.equal(card.amex.expiry_date, '08/18');
                    assert.equal(card.amex.cvv, '123');

                    done();
                }).catch(done);
            });

            it('should extend the default values for first-level profile', function (done) {
                fixo.load('card', 'GB').then(function (card) {
                    assert.isUndefined(card.default);
                    assert.equal(card.switch.expiry_date, '08/18');
                    assert.equal(card.switch.start_date, '01/14');

                    assert.equal(card.amex.expiry_date, '08/18');
                    assert.equal(card.amex.start_date, '01/14');
                    done();
                }).catch(done);
            });

            it('should extend the default values for second-level profile', function (done) {
                fixo.load('card', 'GB-en').then(function (card) {
                    assert.isUndefined(card.default);
                    assert.equal(card.switch.expiry_date, '08/18');
                    assert.equal(card.switch.start_date, '01/12');

                    assert.equal(card.amex.expiry_date, '08/18');
                    assert.equal(card.amex.start_date, '01/12');
                    done();
                }).catch(done);
            });

            it('should extend the default values when returning ' +
                'master data for unknown profile',
                function (done) {
                    fixo.load('card', 'UNKNOWN').then(function (card) {
                        assert.isUndefined(card.default);
                        assert.equal(card.visa.expiry_date, '08/18');
                        assert.equal(card.visa.account_number, '4213423432432234');

                        assert.equal(card.amex.expiry_date, '08/18');
                        assert.equal(card.amex.account_number, '344651926666442');
                        done();
                    }).catch(done);
                }
            );
        });

        describe('Without master profile', function () {
            it('should extend the default values', function (done) {
                fixo.load('card_no_master').then(function (card) {
                    assert.isUndefined(card.default);
                    assert.equal(card.visa.expiry_date, '08/18');
                    assert.equal(card.visa.cvv, '123');

                    done();
                }).catch(done);
            });

            it('should still return a fixture if profile is unknown', function (done) {
                fixo.load('card_no_master', 'GB').then(function (card) {
                    assert.isUndefined(card.default);
                    assert.equal(card.visa.expiry_date, '08/18');
                    assert.equal(card.visa.cvv, '123');
                    done();
                }).catch(done);
            });

            it('should load object property extended from default values', function (done) {
                fixo.load('card_no_master.visa').then(function (visa) {
                    assert.isDefined(visa);
                    assert.equal(visa.expiry_date, '08/18');
                    assert.equal(visa.cvv, '123');
                    done();
                }).catch(done);
            });
        });
    });

    describe('@loadSync: fixo#loadSync', function () {
        describe('With master profile', function () {
            it('should extend the default values for each property', function () {
                var card = fixo.loadSync('card');
                assert.isUndefined(card.default);

                assert.equal(card.visa.expiry_date, '08/18');
                assert.equal(card.visa.cvv, '123');

                assert.equal(card.amex.expiry_date, '08/18');
                assert.equal(card.amex.cvv, '123');
            });

            it('should extend the default values for other profile', function () {
                var card = fixo.loadSync('card', 'GB');
                assert.isUndefined(card.default);
                assert.equal(card.visa.expiry_date, '08/18');
                assert.equal(card.visa.start_date, '01/14');
            });

            it('should extend the default values when returning ' +
                'master data for unknown profile',
                function () {
                    var card = fixo.loadSync('card', 'UNKNOWN');
                    assert.isUndefined(card.default);
                    assert.equal(card.visa.expiry_date, '08/18');
                    assert.equal(card.visa.account_number, '4213423432432234');

                    assert.equal(card.amex.expiry_date, '08/18');
                    assert.equal(card.amex.account_number, '344651926666442');
                });
        });

        describe('Without master profile', function () {
            it('should extend the default values', function () {
                var card = fixo.loadSync('card_no_master');
                assert.isUndefined(card.default);
                assert.equal(card.visa.expiry_date, '08/18');
                assert.equal(card.visa.cvv, '123');
            });

            it('should still return a fixture if profile is unknown', function () {
                var card = fixo.loadSync('card_no_master', 'GB');
                assert.isUndefined(card.default);
                assert.equal(card.visa.expiry_date, '08/18');
                assert.equal(card.visa.cvv, '123');
            });

            it('should load object property extended from default values', function () {
                var visa = fixo.loadSync('card_no_master.visa');
                assert.isDefined(visa);
                assert.equal(visa.expiry_date, '08/18');
                assert.equal(visa.cvv, '123');
            });
        });
    });
});
