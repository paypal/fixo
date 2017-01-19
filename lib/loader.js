'use strict';

var path = require('path');
var fs = require('fs');
var Promise = require('bluebird');
var _ = require('lodash');
var stripComments = require('strip-json-comments');
var debug = require('debug')('fixo:load');

var resolvers = require('./resolvers');
var macros = require('./macros');

var readFile;

// Constants
var PROFILE_MASTER = 'master';
var PROPERTY_DEFAULT = 'default';

var PROFILE_SEPARATOR = '-';
var MACRO_SEPARATOR = '-';

function Loader(options) {
    this._options = options || {};
    this._options.defaultProfile = this._options.defaultProfile || PROFILE_MASTER;
    this._cache = {};
    this._macros = {};
    this._resolvers = {};

    _.forEach(macros, function (macro, name) {
        this.addMacro(name, macro);
    }.bind(this));

    _.forEach(resolvers, function (resolver, name) {
        this.addResolver(name, resolver);
    }.bind(this));
}

// Resolvers
Loader.prototype.addResolver = function (name, resolver) {
    if (!this._isValidResolverOrMacroName(name)) {
        throw new TypeError('Resolver name must must be alpanumeric');
    }
    this._resolvers[name] = resolver;
};

Loader.prototype.removeResolver = function (name) {
    delete this._resolvers[name];
};

Loader.prototype.getResolver = function (name) {
    return this._resolvers[name];
};

Loader.prototype.resolvers = function () {
    return this._resolvers;
};

// Macros
Loader.prototype.addMacro = function (name, macro) {
    if (!this._isValidResolverOrMacroName(name)) {
        throw new TypeError('Macro name must be alphanumeric');
    }
    this._macros[name] = macro;
};

Loader.prototype.removeMacro = function (name) {
    delete this._macros[name];
};

Loader.prototype.getMacro = function (name) {
    return this._macros[name];
};

Loader.prototype.macros = function () {
    return this._macros;
};

/**
 * Load objects for the given profile.
 *
 * @param {(string|string[])} filename Filename or list of filenames in array.
 * @param {string} [profile] Optional - Profile name.
 * @param {function} [callback] Callback function.
 * @returns {Promise} Promise to the result object
 */
Loader.prototype.load = function (filename, profile, callback) {
    return Promise.resolve().then(function () {
        return this._load(filename, profile);
    }.bind(this)).asCallback(callback);
};

/**
 * Load objects for the given profile.
 *
 * @param {(string|string[])} filename Filename or list of filenames in array.
 * @param {string} [profile] Profile name.
 * @returns {object}
 */
Loader.prototype.loadSync = function (filename, profile) {
    return this._load(filename, profile, true);
};

Loader.prototype._isValidResolverOrMacroName = function (name) {
    return name && /^[a-zA-Z0-9_]*$/.test(name);
};

Loader.prototype._load = function (filename, profile, isSync) {
    var isSingle = false;

    debug('_load() - filename:', filename, 'options:', this._options);

    if (!filename) {
        throw new Error('Filename is required');
    }

    profile = profile || this._options.defaultProfile;
    if (profile && typeof profile !== 'string') {
        throw new TypeError('Profile must be a string');
    }

    if (!Array.isArray(filename)) {
        isSingle = true;
        filename = [filename];
    }

    if (isSync) {
        var objects = this._loadObjectsSync(filename, profile);
        objects.forEach(function (object, index) {
            this._resolveValuesSync(object, object, filename[index], profile);
            if (isSingle && objects.length === 1) {
                objects = objects[0];
            }
        }.bind(this));

        debug('_load() - objects: ', objects);
        return objects;
    }

    return this._loadObjects(filename, profile)
        .then(function (objects) {
            return Promise.all(objects.map(function (object, index) {
                return this._resolveValues(object,
                    object, filename[index], profile);
            }.bind(this)));
        }.bind(this)).then(function (objects) {
            if (isSingle && objects.length === 1) {
                objects = objects[0];
            }

            debug('_load() - objects: ', objects);
            return objects;
        });
};

/**
 * Load objects from files or cache.
 *
 * @param {array} filenames Array of filenames.
 * @param {profile} profile Profile key.
 * @return {array} Array of promises that read from files or cache.
 */
Loader.prototype._loadObjects = function (filenames, profile) {
    debug('_loadObjects() - filenames:', filenames, ', profile:', profile);

    var nameParts = this._resolveFilenames(filenames);
    var readRequests = this._readFiles(nameParts.filenames);

    return Promise.all(readRequests).then(function (fileContents) {
        return this._parseJSON(fileContents, nameParts.filenames, nameParts.objectRefs,
            profile);
    }.bind(this));
};

Loader.prototype._loadObjectsSync = function (filenames, profile) {
    debug('_loadObjectsSync() - filenames:', filenames, ', profile:', profile);
    var nameParts = this._resolveFilenames(filenames);
    var fileContents = this._readFilesSync(nameParts.filenames);

    return this._parseJSON(fileContents, nameParts.filenames, nameParts.objectRefs, profile);
};

Loader.prototype._parseJSON = function (fileContents, fileNames, objectRefs, profile) {
    var objects = [];

    if (!Array.isArray(fileContents)) {
        fileContents = [fileContents];
    }

    fileContents.forEach(function (fileContent, index) {
        var fileName = fileNames[index];
        var object;

        if (typeof fileContent === 'string') {
            try {
                object = JSON.parse(stripComments(fileContent));
                if (this._cache) {
                    this._cache[fileName] = _.cloneDeep(object);
                }

                debug('_parseJSON() - parseJSON and set cache:', fileName);
            } catch (e) {
                throw new Error('JSON parse error: ' + e.message + ', json: ' + fileContent);
            }
        } else {
            object = fileContent;
        }

        // Load object object for the given profile
        object = this._extendObject(object, profile);

        // Get object attribute value
        var objectRef = objectRefs[index];
        if (objectRef) {
            debug('_parseJSON() - objecRef: ' + objectRef);
            object = _.get(object, objectRef);
        }

        objects.push(object);
    }.bind(this));

    return objects;
};

Loader.prototype._resolveFilenames = function (filenames) {
    var objectRefs = [];
    var names = [];

    if (!Array.isArray(filenames)) {
        filenames = [filenames];
    }

    filenames.forEach(function (filename) {
        debug('_resolveFilenames() - filename: ' + filename);

        // Check for attribute reference
        if (filename.indexOf('.') > 1) {
            var filenameParts = filename.split('.');
            filename = filenameParts[0];
            objectRefs.push(filenameParts.splice(1).join('.'));
        } else {
            objectRefs.push(undefined);
        }

        names.push(filename);
    });

    return {
        objectRefs: objectRefs,
        filenames: names
    };
};

/**
 * Read the content from files or return the content from the cache.
 *
 * @param {array} filenames Array of filenames.
 * @param {profile} profile Profile key.
 * @return {array} Array of promises that read from files or cache.
 */
Loader.prototype._readFiles = function (filenames) {
    var cache = this._cache;

    if (!readFile) {
        readFile = Promise.promisify(fs.readFile);
    }

    var promises = filenames.map(function (filename) {
        // Return cached data if there is any
        if (cache && cache[filename]) {
            return Promise.resolve().then(function () {
                debug('_readFiles() - cache found:', filename);
                return _.cloneDeep(cache[filename]);
            });
        }

        var filePath = path.join(this._options.srcDir || '', filename) + '.json';
        return readFile(filePath, 'utf-8');
    }.bind(this));

    return promises;
};

/**
 * Read the file content or return the content from the cache.
 *
 * @param {array} filenames Array of filenames.
 * @param {profile} profile Profile key.
 * @return {array} Array of file contents or cached objects.
 */
Loader.prototype._readFilesSync = function (filenames) {
    var cache = this._cache;
    var fileContents = [];

    filenames.forEach(function (filename) {
        // Return cached data if there is any
        if (cache && cache[filename]) {
            debug('_readFilesSync() - cache found:', filename);
            fileContents.push(_.cloneDeep(cache[filename]));
            return;
        }

        var filePath = path.join(this._options.srcDir || '', filename) + '.json';

        debug('_readFilesSync() - filePath: ' + filePath);
        var fileContent = fs.readFileSync(filePath, 'utf-8');
        fileContents.push(fileContent);
    }.bind(this));

    return fileContents;
};

/**
 * Load object for the given profile, with support for object
 * inheritance, composition and default values.
 *
 * TODO: To extend object from all profiles maching any key in the
 *       the profile hierarchy, e.g. dev-mobile should extend from dev and
 *       mobile profiles instead of just the dev profile
 *
 * @param {object} object Object
 * @param {string} profile Profile key.
 * @return {object} Extended object.
 */
Loader.prototype._extendObject = function (object, profile) {
    if (!object) {
        return;
    }

    var result = {};
    var masterObject = object[PROFILE_MASTER];

    if (masterObject) {
        // Return undefined for unknown profile
        if ((profile !== PROFILE_MASTER) && (!object[profile])) {
            return this._extendDefaultValues(masterObject);
        }

        // Extend from parent profiles
        var profileHierarchy = this._extractProfileHierarchy(profile);
        var profileObject;
        var defaultValues = masterObject.default;

        profileHierarchy.forEach(function (profile) {
            profileObject = object[profile];
            if (profileObject) {
                if (defaultValues && profileObject.default) {
                    defaultValues = _.merge({}, defaultValues, profileObject.default);
                }
                _.merge(result, profileObject);
            }
        });

        if (defaultValues) {
            result.defaultValues = defaultValues;
        }

        result = this._extendDefaultValues(result);
    } else {
        result = this._extendDefaultValues(object);
    }

    return result;
};

/**
 * Parse profile string with '-' separator to an array profile hierarchy with
 * master as the root. Example: GB-en-dev => ['master', 'GB', 'en', 'GB-en', GB-en-dev'].
 *
 * @param {string} profile Profile string with - separator, e.g. GB-en-dev.
 * @returns {array} An array of profile hierarchy.
 */
Loader.prototype._extractProfileHierarchy = function (profile) {
    if (!profile) {
        return [PROFILE_MASTER];
    }

    var profileParts = profile.split(PROFILE_SEPARATOR);
    var profileHierarchy = [];
    var profileKey;

    // Append unique individual profile
    profileHierarchy = profileHierarchy.concat(_.uniq(profileParts));

    // Append combination parts
    profileParts.forEach(function (part, index) {
        if (profileKey) {
            profileKey += PROFILE_SEPARATOR + part;
        } else {
            profileKey = part;
        }

        if (index > 0) {
            profileHierarchy.push(profileKey);
        }
    });

    // Append master profile if needed
    if (profileHierarchy[0] !== PROFILE_MASTER) {
        profileHierarchy.splice(0, 0, 'master');
    }

    debug('_extractProfileHierarchy() - return:', profileHierarchy);
    return profileHierarchy;
};

/**
 * Lookup for 'default' key in an object and extend the values of
 * the other key from the default key.
 *
 * @param {object} object
 * @returns {object}
 */
Loader.prototype._extendDefaultValues = function (object) {
    var defaultValues = object.default;
    var result = {};

    if (!defaultValues) {
        return object;
    }

    debug('_extendDefaultValues()', object.default);

    Object.keys(object).forEach(function (key) {
        if (key !== PROPERTY_DEFAULT) {
            result[key] = _.merge({}, defaultValues, object[key]);
        }
    });

    return result;
};

/**
 * Resolve macros and object references. Resolvers supported:
 * - ref: To retrieve property value of current object
 * - fix: To retrieve property value of object in another file
 *
 * @param {object} object Object which values need to be resolved.
 * @param {object} rootObject Root object.
 * @param {string} filename Filename.
 * @param {string} profile
 * @returns {Promise} Promise to all the loaded dependent objects
 */
Loader.prototype._resolveValues = function (object, rootObject, filename, profile) {
    profile = this._processResolvedProfile(object, profile);

    return new Promise(function (resolve, reject) {
        var refs = this._findReferencesOrResolveMacros(object, profile);
        var context = this._getResolverContext(rootObject, filename);
        var loader = this;

        function resolverMiddleware(next) {
            return function (name, resolver) {
                return function () {
                    if (!refs[name]) {
                        if (next) {
                            next();
                        }
                        return;
                    }

                    resolver.bind(context)(refs[name] || {}, function (err, resolvedProps) {
                        debug('_resolveValues() - resolver:' + name + ' - err: ', err,
                            ', resolvedProps:', resolvedProps);
                        if (err) {
                            return reject(err);
                        }

                        _.assign(object, resolvedProps);

                        if (next) {
                            return next();
                        }
                    });
                };
            };
        }

        this.chainResolvers(this.resolvers(), resolverMiddleware, function () {
            loader._resolveNestedObjects(object, rootObject, filename, profile)
                .then(resolve, reject);
        })();
    }.bind(this));
};

/**
 * Chain resolver execution one after another.
 * @param {object} resolvers Resolver function map
 * @param {function} resolverMiddleware Create resolver middleware
 */
Loader.prototype.chainResolvers = function (resolvers, resolverMiddleware,
    finalHandler) {
    var chainedResolvers = finalHandler;

    Object.keys(resolvers).reverse().forEach(function (name) {
        var resolver = resolvers[name];
        chainedResolvers = resolverMiddleware(chainedResolvers)(name, resolver);
    });

    return chainedResolvers;
};

/**
 * Resolve macros and object references. Resolvers supported:
 * - ref: To retrieve property value of current object
 * - fix: To retrieve property value of object in another file
 *
 * @param {object} object Object which values need to be resolved.
 * @param {object} rootObject Root object.
 * @param {string} filename Filename.
 * @param {string} profile
 * @returns {object} Updated object with resolved values.
 */
Loader.prototype._resolveValuesSync = function (object, rootObject, filename, profile) {
    profile = this._processResolvedProfile(object, profile);
    var refs = this._findReferencesOrResolveMacros(object, profile);
    var context = this._getResolverContext(rootObject, filename);
    var resolvers = this.resolvers();

    Object.keys(this.resolvers()).forEach(function (name) {
        _.assign(object, resolvers[name].bind(context)(refs[name] || {}));
    });

    _.map(object, function (value) {
        if (typeof value === 'object') {
            this._resolveValuesSync(value, rootObject, filename, profile);
        }
    }.bind(this));

    return object;
};

Loader.prototype._getResolverContext = function (rootObject, filename) {
    return {
        rootObject: rootObject,
        filename: filename,
        loadObjects: this._loadObjects.bind(this),
        loadObjectsSync: this._loadObjectsSync.bind(this)
    };
};

/**
 * Further resolve property values of object type.
 *
 * @param {object} object Object which values need to be resolved.
 * @param {object} rootObject Root object.
 * @param {string} filename Filename.
 * @param {string} profile
 * @returns {Promise} Resolved nested object
 */
Loader.prototype._resolveNestedObjects = function (object, rootObject, filename, profile) {
    return Promise.resolve().then(function () {
        var resolveNestedObjects = _.map(object, function (value) {
            if (typeof value === 'object') {
                return this._resolveValues(value, rootObject,
                    filename, profile);
            }
        }.bind(this));

        return Promise.all(resolveNestedObjects).then(function () {
            return object;
        });
    }.bind(this));
};

Loader.prototype._updateObject = function (object, props) {
    return props.then(function (resolvedProps) {
        _.assign(object, resolvedProps);
    });
};

/**
 * Resolved object could be from a different profile, e.g. fix.GB:card.
 * All resolved object has its profile tagged, the same profile should be
 * applied for all downstream object references.
 *
 * @param {object} object Object to be checked for resolved profile.
 * @param {profile} profile Parent object profile.
 * @return {string} Resolved profile if there is any, if not would be the given profile.
 */
Loader.prototype._processResolvedProfile = function (object, profile) {
    if (object && (typeof object === 'object') && object._resolved_profile) {
        profile = object._resolved_profile;
        delete object._resolved_profile;
    }

    return profile;
};

/**
 * Resolve macros and find all get and include references for each property.
 * TODO: Move some functionalities to utilities functions called by the resolver.
 *       References returned should only contain props with reference values
 *
 * @param {object} object
 * @return {object} Map of references for each reference type.
 */
Loader.prototype._findReferencesOrResolveMacros = function (object, profile) {
    var refs = {};

    _.forEach(object, function (value, field) {
        if (typeof value === 'string') {
            var valueParts = value.split(':');

            // Value with references
            if (valueParts.length === 2) {
                var resolverName = valueParts[0];
                var refValue = valueParts[1];
                var nameParts = resolverName.split('.');
                var refProfile = profile;

                // TODO: To support passing of arguments in the future, e.g.
                //       [name]-[arg1]-[arg2].[profile]: '[value]'
                if (nameParts.length > 1) {
                    resolverName = nameParts[0];
                    refProfile = nameParts[1];
                }

                debug('_findReferencesOrResolveMacros() - value:', value,
                    ', field:', field, ', resolverName:', resolverName, ', profile:', refProfile);

                if (this.getResolver(resolverName)) {
                    var resolverRefs = refs[resolverName];
                    if (!resolverRefs) {
                        refs[resolverName] = {};
                    }

                    // TODO: To return arguments array once it is supported
                    refs[resolverName][field] = {
                        value: refValue,
                        profile: refProfile
                    };
                }
            } else {
                object[field] = this._resolveMacros(value);
            }
        }
    }.bind(this));

    debug('_findReferencesOrResolveMacros() - refs:', refs);

    return refs;
};

Loader.prototype._resolveMacros = function (value) {
    var macros = value.match(/{[\w-]+}/g);

    if (!macros) {
        return value;
    }

    debug('_resolveMacros() - value:', value, ', macros:', macros);

    var resolved = value;
    macros.forEach(function (macro) {
        var macroName = macro.match(/\{([\w-]+)\}/);
        debug('_resolveMacros() - macroName:', macroName);

        if (!macroName) {
            return;
        }

        macroName = macroName[1];
        var macroParts = macroName.split(MACRO_SEPARATOR);
        var name = macroParts[0];
        var args = macroParts.splice(1);

        var macroFn = this.getMacro(name);
        debug('_resolveMacros() - macro:', name, 'args:', args);

        if (macroFn) {
            resolved = resolved.replace(macro, macroFn.apply(this, args));
            debug('_resolveMacros() - resolvedValue:', resolved);
        }
    }.bind(this));

    return resolved;
};

Loader.prototype._groupReferencesByProfile = function (valueRefs, profile) {
    var values = {};
    var fieldNames = {};

    if (!valueRefs) {
        return {};
    }

    _.forEach(valueRefs, function (ref, field) {
        var refProfile = ref.profile || profile;
        var refValue = ref.value;

        if (!values[refProfile]) {
            values[refProfile] = [];
            fieldNames[refProfile] = [];
        }

        values[refProfile].push(refValue);
        fieldNames[refProfile].push(field);
    });

    debug('_groupReferencesByProfile() - values:', values, ', fieldNames:', fieldNames);

    return {
        values: values,
        fieldNames: fieldNames
    };
};

module.exports = Loader;
