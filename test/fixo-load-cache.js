
'use strict';

var assert = require('chai').assert;
var Fixo = require('../index');

describe('@fixo-load-cache', function () {
    var fixo;

    before(function () {
        fixo = new Fixo({
            srcDir: 'test/fixture'
        });
    });

    describe('@load: fixo#load', function () {
        it('should return a cloned version of the cache', function (done) {
            fixo.load('profile').then(function (profile1) {
                profile1.updated = 'updated';

                fixo.load('profile').then(function (profile2) {
                    assert.isUndefined(profile2.updated);
                    assert.notEqual(profile1, profile2);
                    done();
                });
            }).catch(done);
        });

        it('should be able to resolve nested fixture references ' +
            'for multiple profiles',
            function (done) {
                fixo.load('card', 'US').then(function (card) {
                    assert.equal(card.visa.payload.lang, 'en-US');

                    fixo.load('card', 'GB').then(function (gbCard) {
                        assert.equal(gbCard.visa.payload.lang, 'en-GB');
                        done();
                    });
                }).catch(done);
            }
        );
    });

    describe('@loadSync: fixo#loadSync', function () {
        it('should return a cloned version of the cache', function () {
            var profile1 = fixo.loadSync('profile');
            profile1.updated = 'updated';

            var profile2 = fixo.loadSync('profile');
            assert.isUndefined(profile2.updated);
            assert.notEqual(profile1, profile2);
        });

        it('should be able to resolve nested fixture references ' +
            'for multiple profiles',
            function () {
                var card = fixo.loadSync('card', 'US');
                assert.equal(card.visa.payload.lang, 'en-US');

                var gbCard = fixo.loadSync('card', 'GB');
                assert.equal(gbCard.visa.payload.lang, 'en-GB');
            }
        );
    });
});
