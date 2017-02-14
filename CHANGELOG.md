## v0.6.2 (14 Feb 2017)
* Fix object inheritance does not work if full profile is not defined

## v0.6.1 (19 Jan 2017)
* Support JSON comments

## v0.6.0 (14 Sep 2016)
* Rename baseDir options to srcDir
* Set default srcDir to current working directory
* Add APIs to add/remove resolvers
* Rename ref and fix resolver name to get and include
* Move autoload fixture feature to nemo-fixo
* Remove iterate method

## v0.5.5 (9 May 2016)
* Fix default values not extended by other profiles

## v0.5.4 (19 April 2016)
* Fix runtime error with a null value

## v0.5.3 (13 April 2016)
* Add callback support for fixo#load

## v0.5.2 (12 April 2016)
* Check for object type before setting resolved profile

## v0.5.1 (12 April 2016)
* Fix resolved fixture profile not propagated to downstream references

## v0.5.0 (11 April 2016)
* Add loadSync
* Swap iteratee params to pass profile first then fixture

## v0.4.6 (8 Apr 2016)
* Expose parseMatchingFixtureName in fixo library

## v0.4.5 (7 Apr 2016)
* Add \_\_filename support to load fixture matching the spec name

## v0.4.4 (7 Apr 2016)
* Add support for macros

## v0.4.3 (4 Apr 2016)
* Fix cache with nested fixture when loading different profiles

## v0.4.2 (31 Mar 2016)
* Refactor fixture cache and clone to improve performance

## v0.4.1 (30 Mar 2016)
* Cache loading of fixture file

## v0.4.0 (29 Mar 2016)
* Change iterate method to autoload fixture
* Fix loadFixture not returning an object if a single-element array is passed

## v0.3.2 (29 Mar 2016)
* Extend default values for an unknown profile
* Extend default values for an unknown profile

## v0.3.1 (24 Mar 2016)
* Disable cache by default, there's an issue when working with multiple profiles

## v0.3.0 (23 Mar 2016)
* Add object and fixture references with profile
* Return master object if profile is unknown
* Cache loaded fixture

## v0.2.1 (10 Mar 2016)
* Support for default values for fixture without profile definitions

## v0.2.0 (9 Mar 2016)
* Move debug as dependent library from dev dependencies
* Fix test fixture loading issue

## v0.1.0 (9 Mar 2016)
* First release
