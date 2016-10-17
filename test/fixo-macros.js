var assert = require('chai').assert;
var Loader = require('../lib/loader');

describe('@loader-macros', function () {
    var loader;

    beforeEach(function () {
        loader = new Loader();
    });

    it('should get macro', function () {
        assert.isFunction(loader.getMacro('random'));
    });

    it('should return default macros', function () {
        assert.isObject(loader.macros());
        assert.deepEqual(Object.keys(loader.macros()), ['random']);
    });

    it('should add a new macro', function () {
        var testMacro = function () {};
        loader.addMacro('test', testMacro);

        assert.equal(testMacro, loader.getMacro('test'));
    });

    it('should remove a macro', function () {
        assert.isFunction(loader.getMacro('random'));
        loader.removeMacro('random');
        assert.isUndefined(loader.getMacro('random'));
    });

    it('should throw an error for invalid macro name', function () {
        assert.throws(function () {
            loader.addMacro('test-invalid', function () {});
        }, TypeError, /Macro name/);
    });
});

