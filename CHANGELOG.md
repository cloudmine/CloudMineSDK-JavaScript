# CloudMine JavaScript Library Change Log

## 0.9.22
* Introduces deleteACL function

## 0.9.18
* Bring develop and master into parity with each other

## 0.9.17 August 9, 2016
* Add support for atomic operations via the extend_responses param

## v0.9.15 January 5, 2016
* Add support for an endpoint version to be passed to the WebService as an option.
* Fixes a few small outstanding bugs

## v0.9.14 April 08, 2015
* Fixed a bug with the performance headers not always being set
* Limit the performance header to have only 20 time stamps at a time

## v0.9.13 March 04, 2015
* Updated license
* Updated outdated unit tests
* Fixed a bug when the value returned was just an int

## v0.9.12 May 29, 2014
* added changeCredentials function for new API
* honor url params in options for more functions
* configurable apiroot
* added ACL handling functions

## v0.9.11 August 27, 2013
* Fix bug involving incorrect Content-Length being sent when using node.js and Unicode characters

## v0.9.10 July 24, 2013
* Add ability to send push notifications

## v0.9.9  April 2, 2013
* fixed crashed from incomplete responses due to connection errors
* added ability to destroy via search query

## v0.9.8  March 29, 2013
* Set data to empty string if not present (for content-length)

## v0.9.7  February 18, 2013
* Support usernames explicitly
* Social query support
* Login methods use JSON instead of Authorization header
* Better support for sort parameters, /run endpoint, and accessing shared user data

## v0.9.6 January 29, 2013
* Fixed a bug that caused the UserID to not be saved properly.

## v.0.9.5 November 12, 2012
* Add social login support (creates users as necessary).
* Add user session persistence.
* Fix userid not being set on successful login.
* Remove stray comma breaking IE and other IE fixes.
* createUser: profile option will assign given all properties to the new user object.
* Remove BlobBuilder support and fix Blob construction.
* Removed some unused functions.

* New WebService methods:
  * loginSocial: Create/Login user via OAuth authentication to the given network, e.g. twitter, facebook, github. (Browser only)

## v.0.9.4 September 25th, 2012
* Fix mangled search queries involving ".\w+".
* searchGeo: Required to specify field name as first argument now.
* searchGeo: Add signature to handle (field, latitude, longitude, options).
* searchGeo: Remove distance default of true, moved to options object.

## v0.9.3 September 24th, 2012
* Fix searchGeo parameters being reversed.
* Update documentation to updateUser function since it is misleading.
* updateUser no longer accepts null as a valid field name to change.
* Handle get(options) correctly.

## v0.9.2 September 14th, 2012
* Add Internet Explorer 10 as an officially supported browser.
* Add Cakefile to easily minify CloudMine library, regenerate documentation and perform tests.
* Add support for distance parameter for meta results.
* Fixed upload not naming files as random key when requested.
* Application name and version are reported as part of user agent when specified (analytics).
* More consistent handling of errors from server.
* Remove Base64 implementation, use btoa instead.
* Remove redundant appid/apikey specification in APICall configs.

*	New WebService methods:
  * allUsers: List user objects in your application.
  * deleteUser: Delete a user based with login credentials, or master key.
  * getUser: Get a specific user object in your application.
  * run: Directly invoke code snippets instead of requiring usage of other method.
  * searchGeo: Perform a geo-location search for objects near the given object.
  * searchUsers: Search user objects in your application.
  * updateUser: Update a given user object.

## v0.9 July 14th, 2012
* Rewrote JavaScript library to object oriented version.
