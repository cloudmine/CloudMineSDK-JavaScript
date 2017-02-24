var fs = Import('fs');
var path = Import('path');
var cryptoMod = Import('crypto');
var cloudmine = Import('../js/cloudmine.js');

$(function() {
  var config = Import('./config');
  var util = Import('./util');
  var webservice;

  // calls a method on webservice, but doesn't actually execuate an HTTP request
  function unit_test_method(method_name){
    return function(){
      var call = webservice[method_name].apply(webservice, arguments);
      call.config.cancel = true; // don't make the HTTP call
      return call;
    };
  }

  QUnit.module("Unit Tests", {
    setup: function() {
      webservice = new cloudmine.WebService({
        appid: config.appid,
        apikey: config.apikey,
        apiroot: config.apiroot,
        appname: 'UnitTests',
        appversion: cloudmine.WebService.VERSION
      });
    },

    teardown: function() {
      util.cleanup(webservice);
    }
  });

  test("api unit tests", function(){
    var call, query;

    var api = unit_test_method('api');

    // GET
    call = api('text', {query: {key: 'value'}});
    query = call.url.split("?")[1];
    equal(query, 'key=value', "query in URL matches");
    equal(call.type, "GET", "method is GET");
    equal(call.requestData, undefined, "no data slot in GET query");

    // POST
    call = api('text', {method: 'POST', query: {key: 'value'}});
    query = call.url.split("?")[1];
    equal(query, 'key=value', "query in URL matches");
    equal(call.type, "POST", "method is POST");
    equal(call.requestData, undefined, "no data slot for no data");

    call = api('text', {method: 'POST', query: {key: 'value'}}, {some: 'data'});
    query = call.url.split("?")[1];
    equal(query, 'key=value', "query in URL matches");
    equal(call.type, "POST", "method is POST");
    equal(call.requestData, '{"some":"data"}', "stringified json in data slot");

  });

  test("sort parameters get serialzed properly", function(){
    expect(2);
    var call, query;

    // one sort field
    call = webservice.get(null, {sort: "field1"});
    call.config.cancel = true; // don't make the HTTP call

    query = call.url.split("?")[1];
    equal(query, "sort=field1", "single field");

    // secondary sort field
    call = webservice.get(null, {sort: ["field1", "field2"]});
    call.config.cancel = true; // don't make the HTTP call

    query = call.url.split("?")[1];
    equal(query, "sort=field1&sort=field2", "secondary field");
  });

  test("destroy builds proper URLs", function(){
    var call, query;

    var destroy = unit_test_method('destroy');

    // test empty call
    call = destroy();
    query = call.url.split("?")[1];
    equal(query, null, "empty call");

    // list of keys
    call = destroy(["key1", "key2"]);
    query = call.url.split("?")[1];
    equal(query, "keys=key1%2Ckey2", "list of keys");

    // delete all
    call = destroy(null, {all: true});
    query = call.url.split("?")[1];
    equal(query, "all=true", "delete all");

    // delete via query
    call = destroy(null, {query: {a: 'b'}});
    query = call.url.split("?")[1];
    equal(query, "q=%5Ba%20%3D%20%22b%22%5D", "query");

    // delete via query with nulls and undefineds
    call = destroy(null, {query: {a: 'b', b: null, c: undefined}});
    query = call.url.split("?")[1];
    equal(query, "q=%5Ba%20%3D%20%22b%22%2C%20b%20%3D%20null%2C%20c%20%3D%20undefined%5D", "null and undefined");
  });

  test("search queries can be sent with GET and POST", function(){
    var call, query;
    var search = unit_test_method('search');

    //search({field: 240}, {method: 'POST', limit: 1}).on('complete', function(){

    // standard GET-based query only
    call = search({field: 'value'});
    query = call.url.split("?")[1];
    equal(query, 'q=%5Bfield%20%3D%20%22value%22%5D', "query in URL for GET query only");
    equal(call.data, undefined, "no data for GET query only");
    equal(call.type, "GET", "method is GET");

    // standard GET-based query with params
    call = search({field: 'value'}, {limit: 1});
    query = call.url.split("?")[1];
    equal(query, 'q=%5Bfield%20%3D%20%22value%22%5D&limit=1', "query in URL for GET query with params");


    // POST-based search with no params
    call = search({field: 'value'}, {method: 'POST'});
    query = call.url.split("?")[1];
    equal(query, undefined, "POST search query not set");
    equal(call.requestData, call.config.data);
    equal(call.requestData, JSON.stringify({q: '[field = "value"]'}), "POST data set to search query");

    // POST-based search with params
    call = search({field: 'value'}, {method: 'POST', limit: 1});
    query = call.url.split("?")[1];
    equal(query, 'limit=1', "POST search query just limit");
    equal(call.requestData, call.config.data);
    equal(call.requestData, JSON.stringify({q: '[field = "value"]'}), "POST data set to search query");
  });

  QUnit.module("Integration Tests", {
    setup: function() {
      webservice = new cloudmine.WebService({
        appid: config.appid,
        apikey: config.apikey,
        apiroot: config.apiroot,
        appname: 'UnitTests',
        appversion: cloudmine.WebService.VERSION
      });
    },

    teardown: function() {
      util.cleanup(webservice);
    }
  });

  asyncTest('Verify Get functionality', 10, function() {
    console.log('Verify Get functionality');

    var obj1 = 'test_' + util.noise(5);
    var obj2 = 'test_' + util.noise(5);
    var obj3 = 'test_' + util.noise(5);
    var payload = {}, msg;
    payload[obj1] = { "test123": util.noise(32) };
    payload[obj2] = { "test456": util.noise(32) };
    payload[obj3] = { "test789": util.noise(32) };

    function getObjectsNoParams() {
      msg = "Get all objects without parameters";
      webservice.get().on('error', function(data) {
        ok(false, msg);
      }).on('success', function(data) {
        ok(true, msg);
      }).on('complete', getSingleObject);
    }

    function getSingleObject() {
      msg = "Get single object by key name";
      webservice.get(obj1).on('error', function(data) {
        ok(false, msg);
      }).on('success', function(data) {
        deepEqual(data[obj1], payload[obj1], msg);
      }).on('complete', getSingleObjectViaAPI);
    }

    function getSingleObjectViaAPI() {
      msg = "Get single object by key name via API";
      webservice.api('text', null, {keys: obj1}, null).on('error', function(data) {
        ok(false, msg);
      }).on('success', function(data) {
        deepEqual(data[obj1], payload[obj1], msg);
      }).on('complete', getMultipleObjects);
    }

    function getMultipleObjects() {
      msg = "Get multiple object by array";
      webservice.get([obj1, obj2, obj3]).on('error', function(data) {
        ok(false, msg);
      }).on('success', function(data) {
        deepEqual(data, payload, msg);
      }).on('complete', getObjectsWithOptions);
    }

    function getObjectsWithOptions() {
      msg = "Get all objects with count option";
      webservice.get({count: true}).on('error', function(data) {
        ok(false, msg);
      }).on('success', function(data, resp) {
        ok(resp.count > 0 && util.keys(data).length > 0, msg);
      }).on('complete', getSingleObjectWithOptions);
    }

    function getSingleObjectWithOptions() {
      msg = "Get single object by key name with count option";
      webservice.get(obj1, {count: true}).on('error', function(data) {
        ok(false, msg);
      }).on('success', function(data, resp) {
        deepEqual(data[obj1], payload[obj1], msg);
        ok(resp.count == 1 && util.keys(data).length == resp.count, "Single object returned, confirmed by count");
      }).on('complete', getMultipleObjectsWithOptions);
    }

    function getMultipleObjectsWithOptions() {
      msg = "Get multiple object by array with count option";
      webservice.get([obj1, obj2, obj3], {count: true}).on('error', function(data) {
        ok(false, msg);
      }).on('success', function(data, resp) {
        deepEqual(data, payload, msg);
        ok(resp.count == 3 && util.keys(data).length == resp.count, "Multiple object returned, confirmed by count");
      }).on('complete', start);
    }

    // Start tests
    msg = "Created test payload";
    webservice.set(payload).on('error', function() {
      ok(false, msg);
    }).on('success', function() {
      util.track(webservice, payload);
      ok(true, msg);
    }).on('complete', getObjectsNoParams);
  });

  asyncTest('Register a new user, verify user, cloudmine-agent, login the user, delete user.', 6, function() {
    console.log('Register a new user, verify user, cloudmine-agent, login the user, delete user.');
    var user = {
      email: util.noise(5) + '@' + util.noise(5) + '.com',
      password: util.noise(5)
    };

    webservice.createUser(user.email, user.password).on('success', function() {
      ok(true, 'Created user ' + user.email + ' with password ' + user.password);
    }).on('error', function() {
      ok(false, 'Created user ' + user.email + ' with password ' + user.password);
    }).on('complete', function(data, apicall) {
      equal(apicall.requestHeaders['X-CloudMine-Agent'],
            'JS/' + cloudmine.WebService.VERSION + ' UnitTests/' + cloudmine.WebService.VERSION,
            'CloudMine Agent exposes app name and version');
      verify();
    });

    function verify() {
      webservice.verify(user.email, user.password).on('error', function() {
        ok(false, "Verified that account was created.");
      }).on('success', function() {
        ok(true, "Verified that account was created.");
      }).on('complete', login);
    }

    function login() {
      webservice.login({email: user.email, password: user.password}).on('success', function(data) {
        ok(data.hasOwnProperty('session_token'), 'Has session token');
      }).on('error', function() {
        ok(false, 'Could not login.');
      }).on('complete', destroy);
    }

    function destroy() {
      webservice.deleteUser({email: user.email, password: user.password}).on('error', function() {
        ok(false, 'User was destroyed');
      }).on('success', function() {
        ok(true, 'User was destroyed');
      }).on('complete', verifyDestroy);
    }

    function verifyDestroy() {
      webservice.verify(user.email, user.password).on('success', function() {
        ok(false, 'Verified that account was destroyed.');
      }).on('error', function() {
        ok(true, 'Verified that account was destroyed.');
      }).on('complete', start);
    }

  });

  asyncTest('Create a user with a profile', 5, function() {
    var username = util.noise(5) + '@' + util.noise(5) + '.com';
    var password = util.noise(12);
    var profile = {
      noise: util.noise(10),
      gamma: { f1: [1,2,3] }
    };

    function createUser() {
      var msg = "Create user " + username + " with password " + password;
      webservice.createUser(username, password, {profile: profile}).on('error', function() {
        ok(false, msg);
      }).on('success', function(data) {
        ok(true, msg);
        notEqual(data.__id__, null, "User has an id");
        for (var key in profile) {
          deepEqual(data[key], profile[key], key + " has the expected value");
        }
      }).on('complete', deleteUser);
    }

    function deleteUser() {
      var msg = 'User was deleted.';
      webservice.deleteUser(username, password).on('success', function() {
        ok(true, msg);
      }).on('error', function() {
        ok(false, msg);
      }).on('complete', start);
    }

    // Start
    createUser();
  });

  asyncTest('Set an object and compare value with existing data', 2, function() {
    console.log('Set an object and compare value with existing data');
    var key = 'test_' + util.noise(5);
    var value = {
      integer: 321,
      string: '321',
      array: [3, '2', 1],
      object: { '3': 2, '1': 'a' }
    };
    webservice.set(key, value).on('success', function() {
      util.track(webservice, key);
      ok(true, 'Successfully set key');
    }).on('error', function() {
      ok(false, 'Successfully set key');
    }).on('complete', verify);

    function verify() {
      webservice.get(key).on('success', function(data) {
        deepEqual(value, data[key], 'Set then get a value. Equivilent?');
      }).on('error', function() {
        ok(false, 'Could not get key');
      }).on('complete', start);
    }
  });

  asyncTest('Create an object with update and compare with existing data', 2, function() {
    console.log('Create an object with update and compare with existing data');
    var key = 'test_' + util.noise(5);
    var value = {
      integer: 321,
      string: '321',
      array: [3, '2', 1],
      object: { '3': 2, '1': 'a' }
    };

    webservice.update(key, value).on('success', function() {
      util.track(webservice, key);
      ok(true, 'Successfully created key');
    }).on('error', function() {
      ok(false, 'Successfully created key');
    }).on('complete', finish);

    function finish() {
      webservice.get(key).on('success', function(data){
        deepEqual(value, data[key], 'Update then get a value.');
      }).on('error', function() {
        ok(false, 'Could not get key.');
      }).on('complete', start);
    }
  });

  asyncTest('Create an object with set, update multiple times and compare to expected state', 13, function() {
    console.log('Create an object with set, update multiple times and compare to expected state');
    // Initial data state
    var state = {
      abc: '1'
    };

    // Various states that this test is going to attempt.
    var tests = [
      {
        change: {string: '123'},
        expect: {
          abc: '1',
          string: '123'
        }
      },
      {
        change: {abc: '2'},
        expect: {
          abc: '2',
          string: '123'
        }
      },
      {
        change: {nest: { value: 'nest_value' } },
        expect: {
          abc: '2',
          string: '123',
          nest: {
            value: 'nest_value'
          }
        }
      },
      {
        change: {a: 42, nest: {value: { subval: 1 }}},
        expect: {
          a: 42,
          abc: '2',
          string: '123',
          nest: {
            value: {
              subval: 1
            }
          }
        }
      },
      {
        change: {nest: [1, '2', 3]},
        expect: {
          a: 42,
          abc: '2',
          string: '123',
          nest: [1, '2', 3]
        }
      },
      {
        change: {},
        expect: {
          a: 42,
          abc: '2',
          string: '123',
          nest: [1, '2', 3]
        }
      }
    ];

    // Expect a set and verification for every test.
    var key = 'test_' + util.noise(5);
    var index = -1;
    function nextTest() {
      var config = tests[++index];
      if (config) {
        var jsonState = JSON.stringify(state);
        webservice.update(key, config.change).on('success', function() {
          util.track(webservice, key);
          // Kick off validation check.
          ok(true, 'Successfully updated key with: ' + jsonState);
          webservice.get(key).on('error', function() {
            ok(false, 'Could not validate key with: ' + jsonState);
          }).on('success', function(data) {
            deepEqual(data[key], config.expect, 'Validating previous key');
          }).on('complete', nextTest);
        }).on('error', function() {
          // Skip validation on failed update requests.
          ok(false, 'Could not update key with: ' + jsonState);
          ok(false, 'Skipping verification due to previous error');
          nextTest();
        });
      } else start();
    }

    // Kick off the initial set.
    var originalState = JSON.stringify(state);
    webservice.set(key, state).on('success', function() {
      util.track(webservice, key);
      ok(true, 'Successfully created test key: ' + originalState);
    }).on('error', function() {
      ok(false, 'Failed to create test key: ' + originalState);
    }).on('complete', nextTest);
  });


  asyncTest('Create an object, delete it and attempt to access post-delete', 3, function() {
    console.log('Create an object, delete it and attempt to access post-delete');
    var key = 'test_' + util.noise(5);
    var value = {
      'A': 'B',
      'C': 'D'
    };

    webservice.set(key, value).on('success', function() {
      util.track(webservice, key);
      ok(true, 'Set key we want to delete');
    }).on('error', function() {
      ok(false, 'Set key we want to delete');
    }).on('complete', destroy);

    function destroy() {
      webservice.destroy(key).on('success', function() {
        ok(true, 'Deleted key');
      }).on('error', function() {
        ok(false, 'Deleted key');
      }).on('complete', verifyDestroy);
    }

    function verifyDestroy() {
      var destroyed = false;
      webservice.get(key).on(404, function() {
        ok(true, 'Error upon trying to get deleted object');
        destroyed = true;
      }).on('error', function() {
        if (!destroyed) ok(false, 'Error upon trying to get deleted object');
      }).on('success', function() {
        ok(false, 'Error upon trying to get deleted object');
      }).on('complete', start);
    }
  });


  asyncTest('Trigger unauthorized and application not found errors via bad appid and bad apikey', 3, function() {
    console.log('Trigger unauthorized and application not found errors via bad appid and bad apikey');
    var key = 'test_' + util.noise(5);
    webservice.set(key, {'Britney': 'Spears'}).on('success', function() {
      util.track(webservice, key);
      ok(true, 'Can set key on safe API Key');
    }).on('error', function() {
      ok(false, 'Can set key on safe API Key');
    }).on('complete', test1);

    var test1_401 = false;
    function test1() {
      var webservice_bad_apikey = new cloudmine.WebService({
        appid: webservice.options.appid,
        apikey: "00000000000000000000000000000001",
        apiroot: webservice.options.apiroot
      });

      webservice_bad_apikey.get(key).on('unauthorized', function() {
        ok(true, '401 error fired correctly for apikey "marc sucks lol"');
        test1_401 = true;
      }).on('error', function() {
        if (!test1_401) ok(false, '401 error fired correctly for apikey "marc sucks lol"');
      }).on('success', function() {
        ok(false, '401 error fired correctly for apikey "marc sucks lol"');
      }).on('complete', test2);
    }

    var test2_404 = false;
    function test2() {
      var webservice_bad_appid = new cloudmine.WebService({
        appid: "00000000000000000000000000000001",
        apikey: webservice.options.apikey,
        apiroot: webservice.options.apiroot
      });

      webservice_bad_appid.get(key).on('unauthorized', function() {
        ok(false, '404 error fired correctly for appid "philly cheese steak" (401 received)');
      }).on('notfound', function() {
        ok(true, '404 error fired correctly for appid "philly cheese steak"');
        test2_404 = true;
      }).on('success', function() {
        ok(false, '404 error fired correctly for appid "philly cheese steak" (200 received)');
      }).on('error', function() {
        if (!test2_404) ok(false, '404 error fired correctly for appid "philly cheese steak"');
      }).on('complete', start);
    }
  });

  asyncTest('Sanity check file search query builder', 7, function() {
    console.log('Sanity check file search query builder');
    // Synchronous test because we are hijacking the search function
    // which searchFiles depends on.

    // Need to temporarily hijack the search function.
    var search = webservice.search, query, expectedResult;
    webservice.search = function(term) {
      ok(term == expectedResult, ['Query: ', query, ', Expecting: ', expectedResult, ', Received: ', term].join(''));
    };

    query = null;
    expectedResult = '[__type__ = "file"]';
    webservice.searchFiles(query);

    query = "";
    expectedResult = '[__type__ = "file"]';
    webservice.searchFiles(query);

    query = 'location[blah = "blah"]';
    expectedResult = '[__type__ = "file"].location[blah = "blah"]';
    webservice.searchFiles(query);

    query = '[].location[blah = "blah"]';
    expectedResult = '[__type__ = "file"].location[blah = "blah"]';
    webservice.searchFiles(query);

    query = '[color = "red"]';
    expectedResult = '[__type__ = "file", color = "red"]';
    webservice.searchFiles(query);

    query = '[color = "red"].location[blah = "blah"]';
    expectedResult = '[__type__ = "file", color = "red"].location[blah = "blah"]';
    webservice.searchFiles(query);

    query = '[color = "red", bad = "good"].location[blah = "blah"]';
    expectedResult = '[__type__ = "file", color = "red", bad = "good"].location[blah = "blah"]';
    webservice.searchFiles(query);

    webservice.search = search;
    start();
  });

  asyncTest('Verify file search query builder succeeds on server', 7, function() {
    console.log('Verify file search query builder succeeds on server');
    var remaining = 7;
    function performTest(query) {
      webservice.searchFiles(query).on('error', function() {
        ok(false, "Query: " + query);
      }).on('success', function() {
        ok(true, "Query: " + query);
      }).on('complete', function() {
        if (--remaining <= 0) start();
      });
    }

    performTest(null);
    performTest("");
    performTest('location[blah = "blah"]');
    performTest('[].location[blah = "blah"]');
    performTest('[color = "red"]');
    performTest('[color = "red"].location[blah = "blah"]');
    performTest('[color = "red", bad = "good"].location[blah = "blah"]');
  });


  asyncTest('Normal behavior: action use user-level data when possible.', 16, function() {
    console.log('Normal behavior: action use user-level data when possible.');
    // Create a new store for this case using webservice's properties.
    var store = new cloudmine.WebService({
      appid: webservice.options.appid,
      apikey: webservice.options.apikey,
      apiroot: webservice.options.apiroot
    });

    var key1 = 'test_object_' + util.noise(11);
    var key2 = 'test_object_' + util.noise(11);
    var key3 = 'test_object_' + util.noise(11);
    var userObj = 'IAMA_UserDataInUserData1';
    var appObj = 'IAMA_AppDataInUserData1';
    var privateUserObj = 'IAMA_UserLevelObject';
    var user = {
      email: util.noise(5) + '@' + util.noise(5) + '.com',
      password: util.noise(5)
    };

    ok(!store.isLoggedIn(), 'User is not currently logged in.');
    ok(store.isApplicationData(), 'Store will refer to application-level data');

    store.set(key1, appObj).on('success', function() {
      util.track(store, key1);
      ok(true, 'Successfully created test object');
    }).on('error', function() {
      ok(false, 'Successfully created test object');
    }).on('complete', verifyValue);

    function verifyValue() {
      store.get(key1).on('success', function(data) {
        deepEqual(data[key1], appObj, 'Set object is the application object');
      }).on('error', function() {
        ok(false, 'Could not verify value of key');
      }).on('complete', createUser);
    }

    function createUser() {
      store.createUser(user).on('success', function() {
        ok(true, 'Successfully created a new user.');
      }).on('error', function() {
        ok(false, 'Successfully created a new user.');
      }).on('complete', loginUser);
    }

    function loginUser() {
      store.login(user).on('success', function() {
        ok(true, 'Logged in new user');
      }).on('error', function() {
        ok(false, 'Logged in new user');
      }).on('complete', getUserValue);
    }

    function getUserValue() {
      store.get(key1).on('success', function(data) {
        ok(false, 'Verify that the test object does not exist yet.');
      }).on('error', function() {
        ok(true, 'Verify that the test object does not exist yet.');
      }).on('complete', setUserValue);
    }

    function setUserValue() {
      ok(store.isLoggedIn(), 'User is currently logged in.');
      ok(!store.isApplicationData(), 'Store will refer to user-level data');

      store.set(key2, privateUserObj).on('success', function() {
        util.track(store, key2);
        ok(true, 'Successfully set value of user-level data while logged in as user');
      }).on('error', function() {
        ok(false, 'Successfully set value of user-level data while logged in as user');
      }).on('complete', setAppValue);
    }

    function setAppValue() {
      store.set(key3, '2', {applevel: true}).on('success', function() {
        util.track(store, key3);
        ok(true, 'Successfully set value to application data while logged in as user');
      }).on('error', function() {
        ok(false, 'Successfully set value to application data while logged in as user');
      }).on('complete', verifyUserValue);
    }

    function verifyUserValue() {
      store.get(key2).on('success', function(data) {
        deepEqual(data[key2], privateUserObj, 'Verify user-level data is what we set it to.');
      }).on('error', function() {
        ok(false, 'Could not find value on user-level');
      }).on('complete', verifyAppValue);
    }

    function verifyAppValue() {
      store.get(key3, {applevel: true}).on('success', function(data) {
        deepEqual(data[key3], '2', 'Verify application-data is the application object we set it to.');
      }).on('error', function() {
        ok(false, 'Could not find value on application level.');
      }).on('complete', deleteAppLevelData);
    }

    function deleteAppLevelData() {
      store.destroy([key1, key3], {applevel: true}).on('success', function() {
        ok(true, 'App-level data cleanup successful.');
      }).on('error', function() {
        ok(false, 'App-level data cleanup failure.');
      }).on('complete', deleteUserLevelData);
    }

    function deleteUserLevelData() {
      store.destroy([key2], {applevel: false}).on('success', function() {
        ok(true, 'User-level data cleanup successful.');
      }).on('error', function() {
        ok(false, 'User-level data cleanup failure.');
      }).on('complete', deleteUser);
    }

    function deleteUser() {
      var msg = 'User was deleted.';
      webservice.deleteUser(user.email, user.password).on('success', function() {
        ok(true, msg);
      }).on('error', function() {
        ok(false, msg);
      }).on('complete', start);
    }

  });

  asyncTest('Force usage of application-level data, even if logged in.', 16, function() {
    console.log('Force usage of application-level data, even if logged in.');
    // Create a new store for this case using webservice's properties.
    var store = new cloudmine.WebService({
      appid: webservice.options.appid,
      apikey: webservice.options.apikey,
      apiroot: webservice.options.apiroot,
      applevel: true
    });

    var key1 = 'test_object_' + util.noise(11);
    var key2 = 'test_object_' + util.noise(11);
    var userObj = 'IAMA_UserDataInAppData2';
    var appObj = 'IAMA_AppLevelObject2';
    var privateUserObj = 'IAMA_UserLevelObject';
    var user = {
      email: util.noise(5) + '@' + util.noise(5) + '.com',
      password: util.noise(5)
    };

    ok(!store.isLoggedIn(), 'User is not currently logged in.');
    ok(store.isApplicationData(), 'Store will refer to application data');
    store.set(key1, appObj).on('success', function() {
      util.track(store, key1);
      ok(true, 'Successfully created test object');
    }).on('error', function() {
      ok(false, 'Successfully created test object');
    }).on('complete', verifyValue);

    function verifyValue() {
      store.get(key1).on('success', function(data) {
        deepEqual(data[key1], appObj, 'Set object is the application object');
      }).on('error', function() {
        ok(false, 'Could not verify value of key');
      }).on('complete', createUser);
    }

    function createUser() {
      store.createUser(user).on('success', function() {
        ok(true, 'Successfully created a new user.');
      }).on('error', function() {
        ok(false, 'Successfully created a new user.');
      }).on('complete', loginUser);
    }

    function loginUser() {
      store.login(user).on('success', function() {
        ok(true, 'Logged in new user');
      }).on('error', function() {
        ok(false, 'Logged in new user');
      }).on('complete', getUserValue);
    }

    function getUserValue() {
      ok(store.isLoggedIn(), 'User is currently logged in.');
      ok(store.isApplicationData(), 'Store will refer to application data');
      store.get(key1).on('success', function(data) {
        deepEqual(data[key1], appObj, 'Verify that we can see application data when logged in');
      }).on('error', function() {
        ok(false, 'Verify that we can see application data when logged in');
      }).on('complete', setAppValue);
    }

    function setAppValue() {
      store.set(key1, userObj).on('success', function() {
        util.track(store, key1);
        ok(true, 'Successfully set value to application data while logged in as user');
      }).on('error', function() {
        ok(false, 'Successfully set value to application data while logged in as user');
      }).on('complete', setUserValue);
    }

    function setUserValue() {
      store.set(key2, privateUserObj, {applevel: false}).on('success', function() {
        util.track(store, key2);
        ok(true, 'Successfully set value of user-level data while logged in as user');
      }).on('error', function() {
        ok(false, 'Successfully set value of user-level data while logged in as user');
      }).on('complete', verifyAppValue);
    }

    function verifyAppValue() {
      store.get(key1).on('success', function(data) {
        deepEqual(data[key1], userObj, 'Verify application-data is the user object we set it to.');
      }).on('error', function() {
        ok(false, 'Could not find value on application level.');
      }).on('complete', verifyUserValue);
    }

    function verifyUserValue() {
      store.get(key2, {applevel: false}).on('success', function(data) {
        deepEqual(data[key2], privateUserObj, 'Verify user-level data is what we set it to.');
      }).on('error', function() {
        ok(false, 'Could not find value on user-level');
      }).on('complete', deleteAppLevelData);
    }

    function deleteAppLevelData() {
      store.destroy(key1, {applevel: true}).on('success', function() {
        ok(true, 'App-level data cleanup successful.');
      }).on('error', function() {
        ok(false, 'App-level data cleanup failure.');
      }).on('complete', deleteUserLevelData);
    }

    function deleteUserLevelData() {
      store.destroy([key2], {applevel: false}).on('success', function() {
        ok(true, 'User-level data cleanup successful.');
      }).on('error', function() {
        ok(false, 'User-level data cleanup failure.');
      }).on('complete', deleteUser);
    }

    function deleteUser() {
      var msg = 'User was deleted.';
      webservice.deleteUser(user.email, user.password).on('success', function() {
        ok(true, msg);
      }).on('error', function() {
        ok(false, msg);
      }).on('complete', start);
    }

  });

  asyncTest('Force usage of user-level data, even if not logged in.', 16, function() {
    console.log('Force usage of user-level data, even if not logged in.');
    // Create a new store for this case using webservice's properties.
    var store = new cloudmine.WebService({
      appid: webservice.options.appid,
      apikey: webservice.options.apikey,
      apiroot: webservice.options.apiroot,
      applevel: false
    });

    var key1 = 'test_object_' + util.noise(11);
    var key2 = 'test_object_' + util.noise(11);
    var userObj = 'IAMA_UserDataInUserData3';
    var appObj = 'IAMA_AppDataInUserData3';
    var privateUserObj = 'IAMA_UserLevelObject';
    var user = {
      email: util.noise(5) + '@' + util.noise(5) + '.com',
      password: util.noise(5)
    };

    ok(!store.isLoggedIn(), 'User is not currently logged in.');
    ok(!store.isApplicationData(), 'Store will refer to user-level data');
    store.set(key1, appObj).on('success', function() {
      util.track(store, key1);
      ok(false, 'Could not create object while not logged in.');
    }).on('error', function() {
      ok(true, 'Could not create object while not logged in.');
    }).on('complete', verifyValue);

    function verifyValue() {
      store.get(key1).on('success', function(data) {
        ok(false, 'Could not get object while not logged in');
      }).on('error', function() {
        ok(true, 'Could not get object while not logged in');
      }).on('complete', createUser);
    }

    function createUser() {
      store.createUser(user).on('success', function() {
        ok(true, 'Successfully created a new user.');
      }).on('error', function() {
        ok(false, 'Successfully created a new user.');
      }).on('complete', loginUser);
    }

    function loginUser() {
      store.login(user).on('success', function() {
        ok(true, 'Logged in new user');
      }).on('error', function() {
        ok(false, 'Logged in new user');
      }).on('complete', getUserValue);
    }

    function getUserValue() {
      ok(store.isLoggedIn(), 'User is currently logged in.');
      ok(!store.isApplicationData(), 'Store will refer to user-level data');
      store.get(key1).on('success', function(data) {
        ok(false, 'Verify that the test object does not exist yet.');
      }).on('error', function() {
        ok(true, 'Verify that the test object does not exist yet.');
      }).on('complete', setUserValue);
    }

    function setUserValue() {
      store.set(key2, privateUserObj).on('success', function() {
        util.track(store, key2);
        ok(true, 'Successfully set value of user-level data while logged in as user');
      }).on('error', function() {
        ok(false, 'Successfully set value of user-level data while logged in as user');
      }).on('complete', setAppValue);
    }

    function setAppValue() {
      store.set(key1, appObj, {applevel: true}).on('success', function() {
        util.track(store, key1);
        ok(true, 'Successfully set value to application data while logged in as user');
      }).on('error', function() {
        ok(false, 'Successfully set value to application data while logged in as user');
      }).on('complete', verifyAppValue);
    }

    function verifyAppValue() {
      store.get(key1, {applevel: true}).on('success', function(data) {
        deepEqual(data[key1], appObj, 'Verify application-data is the application object we set it to.');
      }).on('error', function() {
        ok(false, 'Could not find value on application level.');
      }).on('complete', verifyUserValue);
    }

    function verifyUserValue() {
      store.get(key2).on('success', function(data) {
        deepEqual(data[key2], privateUserObj, 'Verify user-level data is what we set it to.');
      }).on('error', function() {
        ok(false, 'Could not find value on user-level');
      }).on('complete', deleteAppLevelData);
    }

    function deleteAppLevelData() {
      store.destroy(key1, {applevel: true}).on('success', function() {
        ok(true, 'App-level data cleanup successful.');
      }).on('error', function() {
        ok(false, 'App-level data cleanup failure.');
      }).on('complete', deleteUserLevelData);
    }

    function deleteUserLevelData() {
      store.destroy(key2, {applevel: false}).on('success', function() {
        ok(true, 'User-level data cleanup successful.');
      }).on('error', function() {
        ok(false, 'User-level data cleanup failure.');
      }).on('complete', deleteUser);
    }

    function deleteUser() {
      var msg = 'User was deleted.';
      webservice.deleteUser(user.email, user.password).on('success', function() {
        ok(true, msg);
      }).on('error', function() {
        ok(false, msg);
      }).on('complete', start);
    }

  });

  asyncTest('Ensure code snippets execute standalone', 1, function() {
    var sent = {abc: '123', def: 'hij'};
    webservice.run('test_standalone', sent).on('result', function(data) {
      var result = {you_sent: sent, i_am: 'test_standalone'};
      deepEqual(data, result, 'test_standalone snippet call returned expected results');
    }).on('complete', start);
  });

  asyncTest('Code snippets - integer', 1, function() {
    webservice.run('test_integer').on('result', function(data) {
      var result = 42;
      deepEqual(data, result, 'test_integer snippet call returned expected results');
    }).on('complete', start);
  });

  asyncTest('Code snippets - string', 1, function() {
    webservice.run('test_string').on('result', function(data) {
      var result = "I'm a string";
      deepEqual(data, result, 'test_string snippet call returned expected results');
    }).on('complete', start);
  });

  asyncTest('Code snippets - array', 1, function() {
    webservice.run('test_array').on('result', function(data) {
      var result = ["one", 2];
      deepEqual(data, result, 'test_array snippet call returned expected results');
    }).on('complete', start);
  });

  asyncTest('Ensure code snippets execute properly for actions', 34, function() {
    console.log('Ensure code snippets execute properly for actions');
    var opts = {snippet: 'reverse', params: {a: 1, b: { c: 2 }}};
    var key = 'code_snip_test_' + util.noise(8);
    var user = {email: util.noise(32) + '@' + util.noise(32) + '.com', password: util.noise(32)};

    var snipRan = false;
    webservice.createUser(user).on('success', function() {
      ok(true, 'Created user for code snippet test');
    }).on('error', function() {
      ok(false, 'Created user for code snippet test');
    }).on('complete', loginUser);

    function loginUser() {
      webservice.login(user).on('success', function() {
        ok(true, 'Logged in user');
      }).on('error', function() {
        ok(false, 'Logged in user');
      }).on('complete', setUserData);
    }

    var userKey = util.noise(32);
    function setUserData() {
      snipRan = false;
      var data = {answerToLifeTheUniverseEverything: 42, query: 'What is the ultimate question to the answer of life, the universe, and everything?', queryResult: null};
      webservice.set(userKey, data, opts).on('result', function() {
        snipRan = true;
      }).on('success', function() {
        util.track(webservice, userKey);
        ok(true, 'Set user data for code snippet test');
      }).on('error', function() {
        ok(false, 'Set user data for code snippet test');
      }).on('complete', function(data) {
        ok(snipRan, 'Snippet ran as expected');
        deepEqual(data && data.result ? util.reverse(data.result.success) : null, data.success, "Success data matches matches reversed output");
        updateUserData();
      });
    }

    function updateUserData() {
      snipRan = false;
      var data = {destination: 'restaurant at the end of the universe'};
      webservice.update(userKey, data, opts).on('result', function() {
        snipRan = true;
      }).on('success', function() {
        util.track(webservice, userKey);
        ok(true, 'Update user data for code snippet test');
      }).on('error', function() {
        ok(false, 'Update user data for code snippet test');
      }).on('complete', function(data) {
        ok(snipRan, 'Snippet ran as expected');
        deepEqual(data && data.result ? util.reverse(data.result.success) : null, data.success, "Success data matches matches reversed output");
        getUserData();
      });
    }

    function getUserData() {
      snipRan = false;
      webservice.get(userKey, opts).on('result', function() {
        snipRan = true;
      }).on('success', function() {
        ok(true, 'Retrieved user data for code snippet test');
      }).on('error', function() {
        ok(false, 'Retreived user data for code snippet test');
      }).on('complete', function(data) {
        ok(snipRan, 'Snippet ran as expected');
        deepEqual(data && data.result ? util.reverse(data.result.success) : null, data.success, "Success data matches matches reversed output");
        searchUserData();
      });
    }

    function searchUserData() {
      snipRan = false;
      webservice.search('[answerToLifeTheUniverseEverything = 42]', opts).on('result', function() {
        snipRan = true;
      }).on('success', function() {
        ok(true, 'Searched user data for code snippet test');
      }).on('error', function() {
        ok(false, 'Searched user data for code snippet test');
      }).on('complete', function(data) {
        ok(snipRan, 'Snippet ran as expected');
        deepEqual(data && data.result ? util.reverse(data.result.success) : null, data.success, "Success data matches matches reversed output");
        deleteUserData();
      });
    }

    function deleteUserData() {
      snipRan = false;
      webservice.destroy(userKey, opts).on('result', function() {
        snipRan = true;
      }).on('success', function() {
        ok(true, 'Deleted user data for code snippet test');
      }).on('error', function() {
        ok(false, 'Deleted user data for code snippet test');
      }).on('complete', function(data) {
        ok(snipRan, 'Snippet ran as expected');
        deepEqual(data && data.result ? util.reverse(data.result.success) : null, data.success, "Success data matches matches reversed output");
        logoutUser();
      });
    }

    function logoutUser() {
      util.cleanup(webservice, webservice.options.session_token);
      webservice.logout().on('success', function() {
        ok(true, 'Logged out user');
      }).on('error', function() {
        ok(false, 'Logged out user');
      }).on('complete', setAppData);
    }

    var appKey = util.noise(32);
    function setAppData() {
      snipRan = false;
      var data = {solong: 'and thanks for all the fish', arthur: 'dent'};
      webservice.set(appKey, data, opts).on('result', function() {
        snipRan = true;
      }).on('success', function() {
        util.track(webservice, appKey);
        ok(true, 'Set application data for code snippet test');
      }).on('error', function() {
        ok(false, 'Set application data for code snippet test');
      }).on('complete', function(data) {
        ok(snipRan, 'Snippet ran as expected');
        deepEqual(data && data.result ? util.reverse(data.result.success) : null, data.success, "Success data matches matches reversed output");
        updateAppData();
      });
    }

    function updateAppData() {
      snipRan = false;
      var data = {canTheHeartOfGoldBrewTea: 'No, but it resembles something like tea, thicker, and does not taste like tea.'};
      webservice.update(appKey, data, opts).on('result', function() {
        snipRan = true;
      }).on('success', function() {
        util.track(webservice, appKey);
        ok(true, 'Update application data for code snippet test');
      }).on('error', function() {
        ok(false, 'Update application data for code snippet test');
      }).on('complete', function(data) {
        ok(snipRan, 'Snippet ran as expected');
        deepEqual(data && data.result ? util.reverse(data.result.success) : null, data.success, "Success data matches matches reversed output");
        getAppData();
      });
    }

    function getAppData() {
      snipRan = false;
      webservice.get(appKey, opts).on('result', function() {
        snipRan = true;
      }).on('success', function() {
        ok(true, 'Retrieved application data for code snippet test');
      }).on('error', function() {
        ok(false, 'Retreived application data for code snippet test');
      }).on('complete', function(data) {
        ok(snipRan, 'Snippet ran as expected');
        deepEqual(data && data.result ? util.reverse(data.result.success) : null, data.success, "Success data matches matches reversed output");
        searchAppData();
      });
    }

    function searchAppData() {
      snipRan = false;
      webservice.search('[arthur = "dent"]', opts).on('result', function() {
        snipRan = true;
      }).on('success', function() {
        ok(true, 'Searched application data for code snippet test');
      }).on('error', function() {
        ok(false, 'Searched application data for code snippet test');
      }).on('complete', function(data) {
        ok(snipRan, 'Snippet ran as expected');
        deepEqual(data && data.result ? util.reverse(data.result.success) : null, data.success, "Success data matches matches reversed output");
        deleteAppData();
      });
    }

    function deleteAppData() {
      snipRan = false;
      webservice.destroy(appKey, opts).on('result', function() {
        snipRan = true;
      }).on('success', function() {
        ok(true, 'Deleted application data for code snippet test');
      }).on('error', function() {
        ok(false, 'Deleted application data for code snippet test');
      }).on('complete', function(data) {
        ok(snipRan, 'Snippet ran as expected');
        deepEqual(data && data.result ? util.reverse(data.result.success) : null, data.success, "Success data matches matches reversed output");
        deleteUser();
      });
    }

    function deleteUser() {
      var msg = 'User was deleted.';
      webservice.deleteUser(user.email, user.password).on('success', function() {
        ok(true, msg);
      }).on('error', function() {
        ok(false, msg);
      }).on('complete', start);
    }

  });

  asyncTest('Verify download integrity.', 4, function() {
    console.log('Verify download integrity.');
    var sourceFile = inBrowser ? "binary.png" : "tests/binary.png";
    if (inBrowser) {
      expect(1);
      ok(true, 'This test currently cannot be performed in browsers for files.');
      start();
    } else {
      var uploadKey = 'test_obj_' + util.noise(8);
      var downloadTo = 'binary_downloaded.png'
      function hash(contents) {
        var md5 = cryptoMod.createHash('md5');
        md5.update(contents);
        var hash = md5.digest('hex');
        return hash;
      }

      var downloadedFile;
      var apicall = webservice.upload(uploadKey, sourceFile).on('success', function() {
        util.track(webservice, uploadKey);
        ok(true, "Uploaded " + sourceFile + " to " + uploadKey);
      }).on('error', function() {
        ok(false, "Uploaded " + sourceFile + " to " + uploadKey);
      }).on('complete', download);

      function download() {
        webservice.download(uploadKey, {filename: downloadTo}).on('error', function() {
          ok(false, 'File was downloaded from server.');
        }).on('success', function(data) {
          ok(true, 'File was downloaded from server.');
        }).on('complete', compareHashes);
      }

      function compareHashes() {
        var exists = fs.existsSync(downloadTo);
        ok(exists, 'File was downloaded to the correct file name.');
        if (exists) {
          var originalHash = hash(fs.readFileSync(sourceFile, 'binary'));
          var downloadedHash = hash(fs.readFileSync(downloadTo, 'binary'));
          ok(downloadedHash === originalHash, "Downloaded file matches content of uploaded");
        } else {
          ok(false, "Downloaded file does not exist on system!");
        }
        start();
      }
    }
  });

  asyncTest('Binary file upload test', 5, function() {
    console.log('Binary file upload test');
    var uploadKey = 'test_obj_' + util.noise(8);
    var sourceFile = inBrowser ? "binary.png" : "tests/binary.png";
    var fileHandle, filename;

    if (inBrowser) {
      if (FileReader) {
        var elem = document.querySelector('#dnd');
        var button = elem.querySelector('button');

        button.addEventListener('click', function skipTest() {
          clearInterval(waitForDrag.interval);
          elem.parentNode.removeChild(elem);
          expect(1);
          ok(true, "Skipped test as directed by user.");
          start();
        }, false);

        function hammerTime(e) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
        elem.addEventListener('dragover', hammerTime, false);
        elem.addEventListener('dragenter', hammerTime, false);
        elem.addEventListener('dragleave', hammerTime, false);
        elem.addEventListener('dragdrop', hammerTime, false);
        elem.addEventListener('drop', function readFile(e) {
          hammerTime(e);
          fileHandle = e.dataTransfer.files[0];
          filename = fileHandle.name;
        }, true);

        // Wait for user input.
        elem.style.display = 'block';

        function waitForDrag() {
          if (fileHandle) {
            clearInterval(waitForDrag.interval);
            elem.style.display = 'none';
            uploadContents();
          }
        }
        waitForDrag.interval = setInterval(waitForDrag, 100);
        waitForDrag();
      } else {
        ok(false, "Incompatible browser configuration!");
        start();
      }
    } else {
      fileHandle = filename = sourceFile;
      uploadContents();
    }

    function uploadContents() {
      // FileReader may cause upload to abort.
      var aborted = false;
      webservice.upload(uploadKey, fileHandle).on('abort', function() {
        aborted = true;
        ok(false, "File reader aborted. If you are using chrome make sure you started with flags: --allow-file-access --allow-file-access-from-files");
      }).on('error', function(data) {
        if (!aborted) ok(false, "User specified file uploaded to server");
      }).on('success', function() {
        util.track(webservice, uploadKey);
        ok(true, "User specified file uploaded to server");
      }).on('complete', verifyUpload);
    }

    function verifyUpload() {
      webservice.get(uploadKey).on('error', function() {
        ok(false, "File was uploaded to server");
      }).on('success', function() {
        ok(true, "File was uploaded to server");
      }).on('complete', downloadFile);
    }

    function downloadFile() {
      webservice.download(uploadKey, {filename: filename.replace(/\.([a-z]+)/, ' (copy).$1')}).on('success', function() {
        ok(true, "Downloaded file to computer");
      }).on('error', function() {
        ok(false, "Downloaded file to computer");
      }).on('complete', destroyFile);
    }

    function destroyFile() {
      webservice.destroy(uploadKey).on('error', function() {
        ok(false, 'Delete file from server');
      }).on('success', function() {
        ok(true, 'Delete file from server');
      }).on('complete', verifyDestroy);
    }

    function verifyDestroy() {
      webservice.get(uploadKey).on('error', function() {
        ok(true, 'File does not exist on server');
      }).on('success', function() {
        ok(false, 'File does not exist on server');
      }).on('complete', start);
    }
  });

  asyncTest("Binary buffer upload test", 5, function() {
    console.log("Binary buffer upload test");
    if (!hasBuffers) {
      expect(1);
      ok(true, "No known binary buffers supported, skipping test.");
      start();
    } else {
      var key = 'binary_buffer_' + util.noise(12);
      var data = '\x01\x02\x03\x04\x05\x06\x07\x08\x09\xF1\xF2\xF3\xF4\xF5\xF6\xF7\xF8\xF9';
      var buffer = util.fillBuffer(data);

      var downloaded = null;
      function downloadData() {
        webservice.download(key, {mode: 'buffer'}).on('error', function() {
          ok(false, 'Download unnamed binary buffer from server');
        }).on('success', function(data) {
          downloaded = util.fillBuffer(data[key]);
          ok(true, 'Downloaded unnamed binary buffer from server');
        }).on('complete', verifyData);
      }

      function verifyData() {
        equal(downloaded ? downloaded.length : null, buffer.length, "Binary buffers have the same length");

        var same = downloaded != null;
        for (var i = 0; same && i < downloaded.length; ++i) {
          same &= downloaded[i] === buffer[i];
        }

        ok(same, "Downloaded buffer contains the same contents as the original buffer.");
        deleteData();
      }

      function deleteData() {
        webservice.destroy(key).on('success', function() {
          ok(true, 'Deleted unnamed binary buffer from server.');
        }).on('error', function() {
          ok(false, 'Deleted unnamed binary buffer from server.');
        }).on('complete', start);
      }

      // Upload the binary buffer to the server. Should automatically be base64 encoded.
      webservice.upload(key, buffer).on('error', function() {
        ok(false, "Upload unnamed binary buffer to server");
      }).on('success', function() {
        util.track(webservice, key);
        ok(true, "Upload unnamed binary buffer to server");
      }).on('complete', downloadData);
    }
  });

  asyncTest("Canvas upload test", 2, function() {
    console.log("Canvas upload test");
    if (!CanvasRenderingContext2D) {
      expect(1);
      ok(true, "Platform does not support Canvas data. Skipping test.");
      start();
    } else {
      // Create a canvas, blue square overlaying red square [credit: MDN].
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext("2d");
      ctx.fillStyle = "rgb(200,0,0)";
      ctx.fillRect (10, 10, 55, 50);
      ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
      ctx.fillRect (30, 30, 55, 50);

      function downloadCanvas() {
        webservice.download(key, {filename: key + ".png"}).on('success', function() {
          ok(true, "Downloaded canvas. Should be a red square with a blue square overlaid.");
        }).on('error', function() {
          ok(false, "Downloaded canvas. Should be a red square with a blue square overlaid.");
        }).on('complete', start);
      }

      var key = "canvas_image_" + util.noise(12);
      webservice.upload(key, ctx).on('success', function() {
        util.track(webservice, key);
        ok(true, 'Uploaded canvas to server');
      }).on('error', function() {
        ok(false, 'Uploaded canvas to server');
      }).on('complete', downloadCanvas);
    }
  });

  asyncTest("User update/search test with strings as parameters", 16, function(){
    var msg;
    var user = {
      email: util.noise(5) + '@' + util.noise(5) + '.com',
      password: util.noise(5)
    };

    var key = util.noise(10), value = util.noise(10);
    var key2 = util.noise(10), value2 = util.noise(10);

    var nonExistingKey = util.noise(10), nonExistingValue = util.noise(10);
    var nonExistingKey2 = util.noise(10), nonExistingValue2 = util.noise(10);

    function createUser() {
      msg = "Create test user";
      webservice.createUser({email: user.email, password: user.password}).on('error', function() {
        ok(false, msg);
      }).on('success', function() {
        ok(true, msg);
      }).on('complete', login);
    }

    function login() {
      msg = "Login with test user";
      webservice.login({email: user.email, password: user.password}).on('error', function() {
        ok(false, msg);
      }).on('success', function() {
        ok(true, msg);
      }).on('complete', updateFirstKey);
    }

    function updateFirstKey() {
      msg = "Update test key " + key + " to value " + value;
      webservice.updateUser(key, value).on('error', function() {
        ok(false, msg);
      }).on('success', function() {
        ok(true, msg);
      }).on('complete', updateSecondKey);
    }

    function updateSecondKey() {
      msg = "Update 2nd test key " + key2 + " to value " + value2;
      webservice.updateUser(key2, value2).on('error', function() {
        ok(false, msg);
      }).on('success', function() {
        ok(true, msg);
      }).on('complete', searchExistingLogout);
    }

    function searchExistingLogout() {
      msg = "Logging user out to search for existing keys";
      webservice.logout().on('error', function() {
        ok(false, msg);
      }).on('success', function() {
        ok(true, msg);
      }).on('complete', searchExistingFirstKey);
    }

    function searchExistingFirstKey() {
      msg = "Searching for user with " + key + "=" + value;
      webservice.searchUsers('[' + key + '="' + value + '"]').on('error', function() {
        ok(false, msg);
      }).on('success', function(data) {
        ok(true, msg);
        var users = util.keys(data);
        equal(1, users.length, "One user matches key.");
        deepEqual(value, data[users[0]][key], "Data matches what was sent to server.");
      }).on('complete', searchExistingMultipleKey);
    }

    function searchExistingMultipleKey() {
      msg = "Searching for user with keys " + key + ", " + key2;
      webservice.searchUsers('[' + key + '="' + value + '", ' + key2 + '="' + value2 + '"]').on('error', function() {
        ok(false, msg);
      }).on('success', function(data) {
        var users = util.keys(data);
        equal(1, users.length, "One user matches key.");
        deepEqual(value, data[users[0]][key], "First key matches what was sent to server.");
        deepEqual(value2, data[users[0]][key2], "Second key matches what was sent to server.");
      }).on('complete', searchMissingFirstKey);
    }

    function searchMissingFirstKey() {
      msg = "Searching for user with missing key " + nonExistingKey + "=" + nonExistingValue;
      webservice.searchUsers('[' + nonExistingKey + '="' + nonExistingValue + '"]').on('error', function() {
        ok(false, msg);
      }).on('success', function(data) {
        ok(true, msg);
        equal(0, util.keys(data).length, "No users matches missing key.");
      }).on('complete', searchMissingMultipleKey);
    }

    function searchMissingMultipleKey() {
      msg = "Searching for user with missing keys " + nonExistingKey + ", " + nonExistingKey2;
      webservice.searchUsers('[' + nonExistingKey + '="' + nonExistingValue + '", ' + nonExistingKey2 + '="' + nonExistingValue2 + '"]').on('error', function() {
        ok(false, msg);
      }).on('success', function(data) {
        ok(true, msg);
        equal(0, util.keys(data).length, "No users matches missing key.");
      }).on('complete', deleteUser);
    }

    function deleteUser() {
      var msg = 'User was deleted.';
      webservice.deleteUser(user.email, user.password).on('success', function() {
        ok(true, msg);
      }).on('error', function() {
        ok(false, msg);
      }).on('complete', start);
    }

    // Start test
    createUser();
  });

  asyncTest("User update/search test with objects as parameters", 16, function(){
    var msg;
    var user = {
      email: util.noise(5) + '@' + util.noise(5) + '.com',
      password: util.noise(5)
    };

    var key = util.noise(10), value = util.noise(10);
    var key2 = util.noise(10), value2 = util.noise(10);

    var nonExistingKey = util.noise(10), nonExistingValue = util.noise(10);
    var nonExistingKey2 = util.noise(10), nonExistingValue2 = util.noise(10);

    function createUser() {
      msg = "Create test user";
      webservice.createUser({email: user.email, password: user.password}).on('error', function() {
        ok(false, msg);
      }).on('success', function() {
        ok(true, msg);
      }).on('complete', login);
    }

    function login() {
      msg = "Login with test user";
      webservice.login({email: user.email, password: user.password}).on('error', function() {
        ok(false, msg);
      }).on('success', function() {
        ok(true, msg);
      }).on('complete', updateFirstKey);
    }

    function updateFirstKey() {
      msg = "Update test key " + key + " to value " + value;
      var query = {};
      query[key] = value;

      webservice.updateUser(query).on('error', function() {
        ok(false, msg);
      }).on('success', function() {
        ok(true, msg);
      }).on('complete', updateSecondKey);
    }

    function updateSecondKey() {
      msg = "Update 2nd test key " + key2 + " to value " + value2;
      var query = {};
      query[key2] = value2;

      webservice.updateUser(query).on('error', function() {
        ok(false, msg);
      }).on('success', function() {
        ok(true, msg);
      }).on('complete', searchExistingLogout);
    }

    function searchExistingLogout() {
      msg = "Logging user out to search for existing keys";
      webservice.logout().on('error', function() {
        ok(false, msg);
      }).on('success', function() {
        ok(true, msg);
      }).on('complete', searchExistingFirstKey);
    }

    function searchExistingFirstKey() {
      msg = "Searching for user with " + key + "=" + value;
      var query = {};
      query[key] = value;

      webservice.searchUsers(query).on('error', function() {
        ok(false, msg);
      }).on('success', function(data) {
        ok(true, msg);
        var users = util.keys(data);
        equal(1, users.length, "One user matches key.");
        deepEqual(value, data[users[0]][key], "Data matches what was sent to server.");
      }).on('complete', searchExistingMultipleKey);
    }

    function searchExistingMultipleKey() {
      msg = "Searching for user with keys " + key + ", " + key2;
      var query = {};
      query[key] = value;
      query[key2] = value2;

      webservice.searchUsers(query).on('error', function() {
        ok(false, msg);
      }).on('success', function(data) {
        var users = util.keys(data);
        equal(1, users.length, "One user matches key.");
        deepEqual(value, data[users[0]][key], "First key matches what was sent to server.");
        deepEqual(value2, data[users[0]][key2], "Second key matches what was sent to server.");
      }).on('complete', searchMissingFirstKey);
    }

    function searchMissingFirstKey() {
      msg = "Searching for user with missing key " + nonExistingKey + "=" + nonExistingValue;
      var query = {};
      query[nonExistingKey] = nonExistingValue;

      webservice.searchUsers(query).on('error', function() {
        ok(false, msg);
      }).on('success', function(data) {
        ok(true, msg);
        equal(0, util.keys(data).length, "No users matches missing key.");
      }).on('complete', searchMissingMultipleKey);
    }

    function searchMissingMultipleKey() {
      msg = "Searching for user with missing keys " + nonExistingKey + ", " + nonExistingKey2;
      var query = {};
      query[nonExistingKey] = nonExistingValue;
      query[nonExistingKey2] = nonExistingValue2;

      webservice.searchUsers(query).on('error', function() {
        ok(false, msg);
      }).on('success', function(data) {
        ok(true, msg);
        equal(0, util.keys(data).length, "No users matches missing key.");
      }).on('complete', deleteUser);
    }

    function deleteUser() {
      var msg = 'User was deleted.';
      webservice.deleteUser(user.email, user.password).on('success', function() {
        ok(true, msg);
      }).on('error', function() {
        ok(false, msg);
      }).on('complete', start);
    }

    // Start test
    createUser();
  });

  asyncTest("User search by ID", 3, function(){
    var user = {
      email: util.noise(5) + '@' + util.noise(5) + '.com',
      password: util.noise(5)
    },
    id;

    function search(response){
      id = response.__id__;
      webservice.getUser(id)
        .on('success', function(response){
          if (util.keys(response).length == 1){
            ok(true, "Search for user by id, get one result");
          } else {
            ok(false, "Search for user by id, get one result");
          }
        })
        .on('error', function(){
          ok(false, "Search for user by id");
        })
        .on('complete', searchNonExistent)
    }

    function searchNonExistent(response){
      id = util.noise(32);
      webservice.getUser(id)
        .on('success', function(response){
          ok(false, "Search for non-existent user by id, get no results");
        })
        .on('error', function(){
          ok(true, "Search for non-existent user by id, get no results");
        })
        .on('complete', deleteUser)
    }

    function deleteUser() {
      var msg = 'User was deleted.';
      webservice.deleteUser(user.email, user.password).on('success', function() {
        ok(true, msg);
      }).on('error', function() {
        ok(false, msg);
      }).on('complete', start);
    }

    webservice.createUser({email: user.email, password: user.password})
      .on('success', function(response){
        search(response)
      });
  });


  asyncTest("Get all users in app", 1, function(){
    webservice.allUsers()
      .on('success', function(response){
        var numberOfUsers = util.keys(response).length;
        ok(true, numberOfUsers + " users retrieved");
      })
      .on('error', function(response){
        ok(false, "Error retrieveing users.");
      })
      .on('complete', start);
  });

  asyncTest("Find objects by using geo search", 17, function() {
    var msg;
    var obj1 = "test_" + util.noise(5);
    var obj2 = "test_" + util.noise(5);
    var obj3 = "test_" + util.noise(5);

    var payload = {};
    payload[obj1] = {
      loc: {
        __type__: 'geopoint',
        longitude: -75.163994,
        latitude: 39.950727
      },
      name: 'Philadelphia, PA'
    };

    payload[obj2] = {
      loc: {
        __type__: 'geopoint',
        longitude: -75.318146,
        latitude: 40.070400
      },
      name: 'Conshohocken, PA'
    };

    payload[obj3] = {
      loc: {
        __type__: 'geopoint',
        longitude: -73.992920,
        latitude: 40.696050
      },
      name: 'New York, NY'
    };

    function createPayload() {
      msg = "Create test payload";
      webservice.set(payload).on('error', function(data, resp) {
        ok(false, msg);
      }).on('success', function(data, resp) {
        util.track(webservice, payload);
        ok(true, msg);
      }).on('complete', findObjsNearPhilly);
    }

    function findObjsNearPhilly() {
      msg = 'Find objects within 30 miles of Philly';
      webservice.searchGeo('loc', payload[obj1], {radius: '30mi'}).on('error', function(data, resp) {
        ok(false, msg);
      }).on('success', function(data, resp) {
        ok(true, msg);
        deepEqual(data[obj1], payload[obj1], "Found Philadelphia Object");
        deepEqual(data[obj2], payload[obj2], "Found Conshohocken Object");
        deepEqual(undefined, data[obj3], "Did not find New York object");
      }).on('complete', findObjsWithNumberParameters);
    }

    function findObjsWithNumberParameters() {
      msg = 'Find objects within 30 miles of Philly using coordinates';
      webservice.searchGeo('loc', -75, 40, {radius: 30, units: 'mi'}).on('error', function() {
        ok(false, msg);
      }).on('success', function(data, resp) {
        ok(true, msg);
        deepEqual(data[obj1], payload[obj1], "Found Philadelphia Object");
        deepEqual(data[obj2], payload[obj2], "Found Conshohocken Object");
        deepEqual(undefined, data[obj3], "Did not find New York object");

      }).on('complete', findObjsWithDistance);
    }

    function findObjsWithDistance() {
      var metaWasTriggered = false;
      msg = 'Find objects within 30 miles of New York using coordinates';
      webservice.searchGeo('loc', -74, 40.70, {distance: true, radius: 30, units: 'mi'}).on('error', function() {
        ok(false, msg);
      }).on('success', function(data, resp) {
        ok(true, msg);
        deepEqual(undefined, data[obj1], "Did not find Philadelphia Object");
        deepEqual(undefined, data[obj2], "Did not find Conshohocken Object");
        deepEqual(data[obj3], payload[obj3], "Found New York object");
      }).on('meta', function(data, resp) {
        metaWasTriggered = true;
        ok(!data[obj1], "Meta does not contain distance info for " + obj1);
        ok(!data[obj2], "Meta does not contain distance info for " + obj2);
        ok(data[obj3] && data[obj3].geo, "Meta contains distance info for " + obj3);
      }).on('complete', function() {
        ok(metaWasTriggered, "Distance meta data found as expected");
        start();
      });
    }

    // Start tests
    createPayload();
  });

  asyncTest('Attempt a social login to Twitter and Github', 7, function() {
    if (inBrowser) {
      function loginToTwitter() {
        webservice.loginSocial('twitter').on('success', function(data, response) {
          ok(true, "Successfully logged in to Twitter.");
          notEqual(data.session_token, null, "Session token in response");
          equal(webservice.options.session_token, data.session_token, "Session token is saved");
        }).on('error', function(data) {
          ok(false, "Did not successfully login to Twitter.");
        }).on('complete', loginToGithub);
      }

      function loginToGithub() {
        var previousSession = webservice.options.session_token;
        webservice.loginSocial('github').on('success', function(data, response) {
          ok(true, "Successfully logged in to Github.");
          notEqual(data.session_token, null, "Session token in response.");
          equal(webservice.options.session_token, data.session_token, "Session token is saved");
          equal(data.session_token, previousSession, "Session token did not change during github link.");
        }).on('error', function() {
          ok(false, "Did not successfully login to Github.");
        }).on('complete', start);
      }

      // Start tests
      loginToTwitter();
    } else {
      expect(1);
      ok(true, "This feature is not available in Node.JS");
      start();
    }
  });

  asyncTest('Attempt a social query on Twitter', 5, function() {
    if (inBrowser) {
      function queryTwitter() {
          webservice.loginSocial('twitter').on('success', function(data, response) {
              ok(true, "Successfully logged in to Twitter.");
              notEqual(data.session_token, null, "Session token in response");

              var socialQuery = { endpoint: "lists/create.json", method: "POST", network: "twitter" }
              socialQuery.headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
              socialQuery.data = "name=TestList&mode=public&description=HelloWorld"

              webservice.socialQuery(socialQuery).on('success', function(data, response) {
                  ok(true, "Successfully created a list on Twitter.");
                  equal(data.name, "TestList", "List name in response");

                  var socialQuery = { endpoint: "lists/destroy.json", method: "POST", network: "twitter" }
                  socialQuery.headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
                  socialQuery.data = "list_id=" + data.id;

                  webservice.socialQuery(socialQuery).on('success', function(data, response) {
                      ok(true, "Successfully destroyed the list we created.");
                  }).on('error', function(data) {
                      ok(false, "Did not successfully destroy the list.");
                  }).on('complete', start);
              }).on('error', function(data) {
                  ok(false, "Did not successfully create the list.");
                  start();
              });
          }).on('error', function(data) {
              ok(false, "Did not successfully login to Twitter.");
              start();
          });
      }

        // Start tests
      queryTwitter();
    } else {
      expect(1);
      ok(true, "This feature is not available in Node.JS");
      start();
    }
  });

  asyncTest("Test ACL CRUD", 23, function(){
    console.log("Test ACL CRUD")
    var user1 = {
      email: util.noise(5) + '@' + util.noise(5) + '.com',
      password: util.noise(5)
    };

    var user2 = {
      email: util.noise(5) + '@' + util.noise(5) + '.com',
      password: util.noise(5)
    };

    var acl = {
      members: [],
      segments: {
        public: false,
        logged_in: false
      },
      permissions: ["r", "u"]
    }

    var user1_id = null
    var user2_id = null

    var user1_session_token = null
    var user2_session_token = null
    
    var user_object_key = 'test_object_' + util.noise(11);
    var privateUserObj = 'IAMA_UserLevelObject';

    var acl_id = null

    function createUser1() {
      webservice.createUser({email: user1.email, password: user1.password}).on('error', function() {
        ok(false, "Create user1");
      }).on('success', function(data) {
        user1_id = data["__id__"]
        ok(true, "Create user1");
      }).on('complete', createUser2);
    }

    function createUser2() {
      webservice.createUser({email: user2.email, password: user2.password}).on('error', function() {
        ok(false, "Create user2");
      }).on('success', function(data) {
        user2_id = data["__id__"]
        ok(true, "Create user2");
      }).on('complete', loginUser1_CreateUserData);
    }

    function loginUser1_CreateUserData() {
      webservice.login(user1).on('success', function(data) {
        user1_session_token = data.session_token
        ok(true, 'Logged in user1');
      }).on('error', function() {
        ok(false, 'Failed to login as user1');
      }).on('complete', setUser1Value);
    }

    function setUser1Value() {
      webservice.set(user_object_key, privateUserObj).on('success', function() {
        ok(true, 'Successfully set value of user-level data while logged in as user1');
      }).on('error', function() {
        ok(false, 'Failed to set value of user-level data while logged in as user1');
      }).on('complete', logoutUser1_CreateUserData);
    }

    function logoutUser1_CreateUserData() {
      webservice.logout({session_token: user1_session_token}).on('success', function(data) {
        ok(true, 'User1 logged out');
      }).on('error', function() {
        ok(false, 'Failed to logout as user1');
      }).on('complete', loginUser2_NoACL);
    }

    function loginUser2_NoACL() {
      webservice.login(user2).on('success', function(data) {
        user2_session_token = data.session_token
        ok(true, 'Logged in user2');
      }).on('error', function() {
        ok(false, 'Failed to login as user2');
      }).on('complete', verifyNoACL);
    }

    function verifyNoACL() {
      webservice.get(user_object_key, {applevel: false}).on('success', function() {
        ok(false,'User2 had access to user1 data')
      }).on('error', function() {
        ok(true, 'User2 could not find the key');
      }).on('complete', logoutUser2_NoACL);
    }

    function logoutUser2_NoACL() {
      webservice.logout({session_token: user2_session_token}).on('success', function(data) {
        ok(true, 'User2 logged out');
      }).on('error', function() {
        ok(false, 'Failed to logout as user2');
      }).on('complete', loginUser1_CreateACL);
    }

    function loginUser1_CreateACL() {
      webservice.login(user1).on('success', function(data) {
        user1_session_token = data.session_token
        ok(true, 'Logged in as user1');
      }).on('error', function() {
        ok(false, 'Failed to login as user1');
      }).on('complete', createACL);
    }

    function createACL() {            
      acl.members = [user2_id]
      webservice.updateACL(acl).on('error', function() {
        ok(false, "Create ACL as user1");
      }).on('success', function(data) {
        acl_id = Object.keys(data)[0]
        ok(true, "Create ACL as user1");
      }).on('complete', updateObjectWithACL);
    }

    function updateObjectWithACL() {
      webservice.update(user_object_key, {__access__:acl_id}).on('success', function(data) {
        ok(true, 'User1 updated the test object');
      }).on('error', function() {
        ok(false, 'User1 failed to update the test object');
      }).on('complete', logoutUser1_CreateACL);
    }

    function logoutUser1_CreateACL() {
      webservice.logout({session_token: user1_session_token}).on('success', function(data) {
        ok(true, 'User1 logged out');
      }).on('error', function() {
        ok(false, 'Failed to logout as user1');
      }).on('complete', loginUser2_ACL);
    }

    function loginUser2_ACL() {
      webservice.login(user2).on('success', function(data) {
        user2_session_token = data.session_token
        ok(true, 'Logged in as user2');
      }).on('error', function() {
        ok(false, 'Failed to login as user2');
      }).on('complete',  verifyACLCreated);
    }

    function verifyACLCreated() {
      webservice.get(user_object_key, {applevel: false}).on('success', function() {
        ok(true, "User2 got user1 data")
      }).on('error', function() {
        ok(false, 'Could not find user1 data');
      }).on('complete', logoutUser2_ACL);
    }
    
    function logoutUser2_ACL() {
      webservice.logout({session_token: user2_session_token}).on('success', function(data) {
        ok(true, 'User2 logged out');
      }).on('error', function() {
        ok(false, 'Failed to logout as user2.');
      }).on('complete', loginUser1_DeleteACL);
    }

    function loginUser1_DeleteACL() {
      webservice.login(user1).on('success', function(data) {
        user1_session_token = data.session_token
        ok(true, 'Logged in as user1');
      }).on('error', function() {
        ok(false, 'Failed to login as user1');
      }).on('complete', deleteACL);
    }

    function deleteACL() {
      webservice.deleteACL(acl_id).on('success', function() {
        ok(true, 'Test user ACL was deleted.');
      }).on('error', function() {
        ok(false, 'Test user ACL was deleted.');
      }).on('complete', logoutUser1_DeleteACL);
    }

    function logoutUser1_DeleteACL() {
      webservice.logout({session_token: user1_session_token}).on('success', function(data) {
        user1_session_token = data.session_token
        ok(true, 'Logged in as user1');
      }).on('error', function() {
        ok(false, 'Failed to login as user1');
      }).on('complete', loginUser2_DeleteACL);
    }

    function loginUser2_DeleteACL() {
      webservice.login(user2).on('success', function(data) {
        user2_session_token = data.session_token
        ok(true, 'Logged in as user2');
      }).on('error', function() {
        ok(false, 'Failed to  login as user2');
      }).on('complete',  verifyACLDeleted);
    }

    function verifyACLDeleted() {
      webservice.get(user_object_key, {applevel: false}).on('success', function() {
        ok(false, "acl still active")
      }).on('error', function() {
        ok(true, 'User2 could not find the key');
      }).on('complete', logoutUser2_ACLDeleted);
    }
    
    function logoutUser2_ACLDeleted() {
      webservice.logout({session_token: user2_session_token}).on('success', function(data) {
        ok(true, 'User2 logged out');
      }).on('error', function() {
        ok(false, 'Could not login.');
      }).on('complete', deleteUser1);
    }


    function deleteUser1() {
      webservice.deleteUser(user1.email, user1.password).on('success', function() {
        ok(true, 'User1 was deleted');
      }).on('error', function() {
        ok(false, 'User1 was deleted');
      }).on('complete', deleteUser2);
    }    

    function deleteUser2() {
      webservice.deleteUser(user2.email, user2.password).on('success', function() {
        ok(true, 'User2 was deleted');
      }).on('error', function() {
        ok(false, 'User2 was deleted');
      }).on('complete', start);
    }

    // Start test
    createUser1();
  });
});
