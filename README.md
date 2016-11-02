# fixo

Fixo is an extension to JSON parser, it allows you create inheritable and composable JSON objects.

You could use Fixo for configuration files, test fixtures and other cases when you need to create complex objects with dynamic content.

With `Fixo`, you could:
* define a `master` object and extend it into different `profile` variations
* set the `default` property values to be shared with the rest of the object properties
* compose an object from different sources with different `profiles`

The core of `fixo` is the `resolvers` and `macros`. `Resolvers` allow you to transform an object property value as a whole, while `macros` allow you to replace parts of a string value with dynamic content.

## Installation

```sh
$ npm install fixo
```

## How to use it

```js
var Fixo = require('fixo');

// Initialize with options
var fixo = Fixo({
  srcDir: 'test/fixture'  // default: '.'
});

// Load object
fixo.load('card', function(card) { ... });

// Or with Promise
fixo.load('card').then(function(card) { ... });

// Load object property for a profile
fixo.load('cards.visa', 'GB', function(card) { ... });

// Load multiple objects
fixo.load(['card', 'bank'], function(objects) { ... });

// Load JSON file in a folder
fixo.load('folder/card', function(card) { ... });
```

## Options
- **srcDir**: Data source directory to lookup the JSON files (default: `.`)
- **defaultProfile**: Object profile key (default: `master`)

## Data file

Test fixtures example:

```sh
/test/fixtures
  profile.json
  cards.json
  banks.json
```

### Inheritance and override

Fixo supports object inheritance and override in the following sequence:
- `GB` extends from `master`
- `GB-en` extends from `master`, `GB`, `en`
- `GB-en-dev` extends from `master`, `GB`, `en`, `GB-en`

```json
{
  "master": {
    "visa": {
       "account_number": "1111111111111111",
       "expiry_date": "08/18",
       "cvv": "123"
    },
    "diners": {
      "account_number": "22222222222222",
       "expiry_date": "08/18",
       "cvv": "123"
    },
    "amex": {
       "account_number": "333333333333333",
       "expiry_date": "08/18",
       "cvv": "1234"
    }
  },
  "GB": {
    "visa": {
      "account_number": "4444444444444444"
    }
  },
  "en": {},
  "GB-en": {},
  "GB-en-dev": {}
}
```

Profile keys can be anything, it could be a combination of environment and device names if you are using `fixo` to load a configuration file:

```json
{
  "master": {},
  "dev": {},
  "prod": {},
  "desktop": {},
  "mobile": {},
  "dev-desktop": {},
  "dev-mobile": {},
  "prod-destop": {},
  "prod-mobile": {}
}
```

### Default values

Shared default values. Visa, Diners, Amex extend the default values:

```js
{
  "master": {
    "default": {
       "expiry_date": "08/18",
       "cvv": "123"
    },
    "visa": {
       "account_number": "1111111111111111",
       "cvv": "123"
    },
    "diners": {
      "account_number": "22222222222222",
    },
    "amex": {
       "account_number": "333333333333333"
    }
  }
}
```

### Value composition

### Resolvers

Resolver allows you replace a property value as a whole.  Fixo comes with two default resolvers, but you could easily create your own resolver:
- **get**: To retrieve a property value of current object
  - **get.[profile]**: To retrieve a property value of current object for the given the profile
- **include**: To include an object property from another file
  - **include.[profile]**: To include an object property value from another file matching the given profile

```js
{
  "master": {
    "account": {
      "name": "Walter Mitty"
      "locale": "en-US"
    },
    "wallet": {
      "locale": "get:account.locale"
      "bank": "include:banks.citibank",
      "card": "include.CA:cards.visa"
    }
  },
  "GB": {
    "account": {
      "name": "William James"
    }
  }
}
```

**Note:**

``profile`` is propagated to the downstream resolvers:
* `include.CA:cards.visa` will load `cards.visa` for `CA` profile, any resolvers found in `card.visa` will look for `CA` profile.

#### How to Create Custom Resolver

Fixo provides `load` and `loadSync` methods, thus custom resolver function should provide both `sync` and `async` implementations.

Resolver function will be called multiple times for each nested object if there is any matching custom property. Example:

```js
// Fixture name: profile.json
{
  "first_name": "uppercase:Michael",
  "last_name": "uppercase:Troy"
}

// Custom resovler that converts all matching property value to uppercase
// @param props {Object} - Matching property values:
//                         {
//                           [fieldName]: {
//                             value: '[property value]',
//                             profile: '[profile]'
//                           },
//                           ...
//                         }
function upperCaseResolver = function (props, callback) {
    var result = {};
    Object.keys(props).forEach(function (key) {
        result[key] = props[key].value.toUpperCase();
    });

    // async implementation
    if (callback) {
        setTimeout(function () {
            callback(null, result);
        }, 0);

    // sync implementation
    } else {
        return result;
    }
}

// Register resolver
fixo.addResolver('uppercase', upperCaseResolver);

// Load profile - async
fixo.load('profile', function(err, profile) {
  console.log(profile);
});

// Load profile - sync
var profile = fixo.loadSync('profile');
console.log(profile);

// Ouput:
{
  "first_name": "MICHAEL",
  "last_name": "TROY"
}
```

Please refer to the default `get` and `include` resolvers for reference implementation.

**Note:** Dash (-) character is not allowed for the resolver name.

### Macros

Use macros if you need to replace parts of a string value with dynamic content:

```json
{
  "email_1": "test-{random}@domain.com",
  "email_2": "test-{random-numeric-5}@domain.com"
}
```

Fixo shipped with  one built-in macro for now, i.e. `random`. The idea is, it should be easy for you create various macros to suit your test cases.

To add/remove a macro:

```js
fixo.addMacro('test_macro', function(arg1, arg2) {
  return '....';
});

fixo.removeMacro('test_macro');
```

`random` macro generates random 12 alphanumeric characters by default. You could pass arguments to the macro by appending `-` to the macro name. `random` macro takes in two arguments, i.e. `type (alpha|numeric|alphanum)` and `length`.

**Note:** Dash (-) character is not allowed for the macro name.

## License

Copyright (C) 2016 PayPal

Licensed under the Apache License, Version 2.0 (the "License"); you may
not use this file except in compliance with the License. You may obtain
a copy of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
