'use strict';

var assert = require('chai').assert;
var Fixo = require('../index');

describe('@fixo-load-composite: Value composition', function () {
    var fixo;

    before(function () {
        fixo = new Fixo({
            srcDir: 'test/fixture'
        });
    });

    ['load', 'loadSync'].forEach(function (method) {
        describe('@' + method + ' fixo#' + method, function () {
            var composite;

            beforeEach(function (done) {
                if (method === 'load') {
                    fixo.load('composite').then(function (fixture) {
                        composite = fixture;
                        done();
                    }).catch(done);
                } else {
                    composite = fixo.loadSync('composite');
                    done();
                }
            });

            it('should resolve referenced value for the same fixture', function () {
                assert.isDefined(composite);
                assert.equal(composite.name, 'Walter Mitty');
            });

            it('should resolve referenced value from another fixture', function () {
                assert.equal(composite.visa.account_number, '4213423432432234');
            });

            it('should resolve refrenced value from another fixture in a subfolder', function () {
                assert.equal(composite.bankName, 'Standard Chartered');
            });

            it('should resolve referenced value for another profile', function () {
                assert.equal(composite.name_GB, 'William');
            });

            it('should resolve referenced values in nested object', function () {
                var card = composite.wallet.card;

                assert.equal(card.visa.account_number, '4213423432432234');
                assert.equal(card.amex.account_number, '344651926666442');
                assert.equal(card.diners.account_number, '30427303813249');
            });

            it('should resolve referenced values in an array', function () {
                var cards = composite.cards;
                assert.equal(cards[0].account_number, '4213423432432234');
                assert.equal(cards[1].account_number, '344651926666442');
                assert.equal(cards[2].account_number, '30427303813249');
            });

            it('should resolve fixture reference for another profile', function () {
                assert.equal(composite.visa_GB.account_number, '0000000000000000');
            });

            it('should resolve the same profile for downstream fixture references', function () {
                assert.equal(composite.visa_GB.lang, 'en-GB');
            });

            it('should resolve unknown object reference to undefined', function () {
                assert.isUndefined(composite.unknown);
            });

            it('should extend the default values for all the object properties', function () {
                var cards = composite.cards_obj;
                assert.equal(cards.visa.account_number, '4213423432432234');
                assert.equal(cards.visa.expiry_date, '08/18');

                assert.equal(cards.amex.account_number, '344651926666442');
                assert.equal(cards.amex.expiry_date, '08/18');

                assert.equal(cards.diners.account_number, '30427303813249');
                assert.equal(cards.diners.expiry_date, '08/18');
            });
        });
    });
});
