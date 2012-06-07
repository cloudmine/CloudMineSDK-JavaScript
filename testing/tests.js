$(document).ready(function(){
  module('JSON Objects');

  var cm = new cloudmine.WebService({
    appid: '84e5c4a381e7424b8df62e055f0b69db',
    apikey: '84c8c3f1223b4710b180d181cd6fb1df'
  });
  var cm_bad_apikey = new cloudmine.WebService({
    appid: '84e5c4a381e7424b8df62e055f0b69db',
    apikey: 'marc sucks lol'
  });
  var cm_bad_appid = new cloudmine.WebService({
    appid: 'philly cheese steak',
    apikey: '84c8c3f1223b4710b180d181cd6fb1df'
  });

  function noise(count) {
    var out = [];
    while (count-- > 0) out.push('abcdefghijklmnopqrstuvwxyz123456789_'[parseInt(Math.random() * 26)]);
    return out.join("");
  }

  // Test 1: Register a user, then log them
  test('Create user, log in as them', function() {
    var user = {
      email: noise(5) + '@' + noise(5) + '.com',
      password: noise(5)
    };
    
    cm.createUser(user.email, user.password).on('success', function() {
      ok(true, "Created user " + user.email + " with password " + user.password);
    }).on('error', function() {
      ok(false, "Created user " + user.email + " with password " + user.password);
    }).on('complete', login);

    function login() {
      cm.login({userid: user.email, password: user.password}).on('success', function(data){
        ok(data.hasOwnProperty('session_token'), 'Has session token');
      }).on('error', function() {
        ok(false, "Could not login.");
      }).on('complete', start);
    }
    
    // Wait for tests
    stop();
  });


  // Test 2: Create an object with set(), get that key, see if they match
  test('Create object with set, get it, see if equal', function(){
    var key = 'test_object1';
    var value = {
      integer: 321,
      string: '321',
      array: [3, '2', 1],
      object: { '3': 2, '1': 'a' }
    };
    
    cm.set(key, value).on('success', function() {
      ok(true, "Successfully set key");
    }).on('error', function() {
      ok(false, "Successfully set key");
    }).on('complete', verify);
    
    function verify() {
      cm.get(key).on('success', function(data) {
        deepEqual(value, data[key], 'Set then get a value. Equivilent?');
      }).on('error', function() {
        ok(false, "Could not get key");
      }).on('complete', start);

    }

    // Wait for tests
    stop();
  });

  // Test 3: Create an object with update(), get that key, see if they match
  test('Create object with update, get it, see if equal', function(){
    var key = 'test_object2';
    var value = {
      integer: 321,
      string: '321',
      array: [3, '2', 1],
      object: { '3': 2, '1': 'a' }
    };
    
    cm.update(key, value).on('success', function() {
      ok(true, "Successfully created key");
    }).on('error', function() {
      ok(false, "Successfully created key");
    }).on('complete', finish);

    function finish() {
      cm.get(key).on('success', function(data){
        deepEqual(value, data[key], 'Update then get a value.');
      }).on('error', function() {
        ok(false, "Could not get key.");
      }).on('complete', start);
    }

    // Wait for tests
    stop();
  });

  // Test 4: Set an object, then update its attributes one at a time to see if they are changing
  test('Set object and test to see if update works on it', function(){
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
    var key = 'test_object3';
    var index = -1;
    function nextTest() {
      var config = tests[++index];
      if (config) {
        var jsonState = JSON.stringify(state);
        cm.update(key, config.change).on('success', function() {
          // Kick off validation check.
          ok(true, "Successfully updated key with: " + jsonState);
          cm.get(key).on('error', function() {
            ok(false, "Could not validate key with: " + jsonState);
          }).on('success', function(data) {
            deepEqual(data[key], config.expect, "Validating previous key");
          }).on('complete', nextTest);
        }).on('error', function() {
          // Skip validation on failed update requests.
          ok(false, "Could not update key with: " + jsonState);
          ok(false, "Skipping verification due to previous error");
          nextTest();
        });
      } else start();
    }
    
    // Kick off the initial set.
    var originalState = JSON.stringify(state);
    cm.set(key, state).on('success', function() {
      ok(true, "Successfully created test key: " + originalState);
    }).on('error', function() {
      ok(false, "Failed to create test key: " + originalState);
    }).on('complete', nextTest);

    // Wait for tests.
    stop();
  });


  test('Set object, delete it, try to get it again.', function(){
    var key = 'test_object4';
    var value = {
      'A': 'B',
      'C': 'D'
    };

    cm.set(key, value).on('success', function() {
      ok(true, "Set key we want to delete");
    }).on('error', function() {
      ok(false, "Set key we want to delete");
    }).on('complete', destroy);

    function destroy() {
      cm.destroy(key).on('success', function() {
        ok(true, "Deleted key");
      }).on('error', function() {
        ok(false, "Deleted key");
      }).on('complete', verifyDestroy);
    }

    function verifyDestroy() {
      cm.get(key).on(404, function() {
        ok(true, 'Error upon trying to get deleted object');
      }).on('success', function() {
        ok(false, "Error upon trying to get deleted object");
      }).on('complete', start);
    }

    // Wait for tests
    stop();
  });


  // Test 6: Let's fuck some shit up
  test('401, 404 errors for object queries with bad API key and App IDs', function() {
    var key = 'test_object5';
    cm.set(key, {'Britney': 'Spears'}).on('success', function() {
      ok(true, "Can set key on safe API Key");
    }).on('error', function() {
      ok(false, "Can set key on safe API Key");
    }).on('complete', test1);

    function test1() {
      cm_bad_apikey.get(key).on('unauthorized', function() {
        ok(true, '401 error fired correctly for apikey "marc sucks lol"');
      }).on('success', function() {
        ok(false, '401 error fired correctly for apikey "marc sucks lol"');
      }).on('complete', test2);
    }

    function test2() {
      cm_bad_appid.get(key).on('unauthorized', function() {
        ok(true, '404 error fired correctly for appid "philly cheese steak"');
      }).on('success', function() {
        ok(false, '404 error fired correctly for appid "philly cheese steak"');
      }).on('complete', start);
    }

    // Wait for tests.
    stop();
  });

  // Test 7: Search Files alters the query given, lets make sure we are building it right.
  test('Verify query building for file search', function() {
    // Synchronous test because we are hijacking the search function
    // which searchFiles depends on.
    expect(7);

    // Need to temporarily hijack the search function.
    var search = cm.search, query, expectedResult;
    cm.search = function(term) {
      ok(term == expectedResult, ['Query: ', query, ', Expecting: ', expectedResult, ', Received: ', term].join('')); 
    };

    query = null;
    expectedResult = '[__type__ = "file"]';
    cm.searchFiles(query);

    query = "";
    expectedResult = '[__type__ = "file"]';
    cm.searchFiles(query);

    query = 'location[blah = "blah"]';
    expectedResult = '[__type__ = "file"].location[blah = "blah"]';
    cm.searchFiles(query);

    query = '[].location[blah = "blah"]';
    expectedResult = '[__type__ = "file"].location[blah = "blah"]';
    cm.searchFiles(query);

    query = '[color = "red"]';
    expectedResult = '[__type__ = "file", color = "red"]';
    cm.searchFiles(query);

    query = '[color = "red"].location[blah = "blah"]';
    expectedResult = '[__type__ = "file", color = "red"].location[blah = "blah"]';
    cm.searchFiles(query);

    query = '[color = "red", bad = "good"].location[blah = "blah"]';
    expectedResult = '[__type__ = "file", color = "red", bad = "good"].location[blah = "blah"]';
    cm.searchFiles(query);

    cm.search = search;
  });

  // Test 8: Verify buildable queries actually execute on the server.
  test('Verify built queries for file search', function() {
    var remaining = 7;
    function performTest(query) {
      cm.searchFiles(query).on('error', function() {
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

    // Wait for tests
    stop();
  });

  // Test 9: Verify that we can force the store into application-level data mode. 
  test("Verify forced application-level data option.", function() {
    // Create a new store for this case using cm's properties.
    var store = new cloudmine.WebService({
      appid: cm.options.appid,
      apikey: cm.options.apikey,
      applevel: true
    });

    var key = "test_object_" + noise(11);
    var userObj = "IAMA_UserDataInAppData";
    var appObj = "IAMA_AppLevelObject";
    var privateUserObj = "IAMA_UserLevelObject";
    var user = {
      userid: noise(5) + '@' + noise(5) + '.com',
      password: noise(5)
    };
    
    ok(!store.isLoggedIn(), "User is not currently logged in.");
    ok(store.isApplicationData(), "Store will refer to application data");
    store.set(key, appObj).on('success', function() {
      ok(true, 'Successfully created test object');
    }).on('error', function() {
      ok(false, 'Successfully created test object');
    }).on('complete', verifyValue);
    
    function verifyValue() {
      store.get(key).on('success', function(data) {
        deepEqual(data[key], appObj, 'Set object is the application object');
      }).on('error', function() {
        ok(false, 'Could not verify value of key');
      }).on('complete', createUser);
    }

    function createUser() {
      store.createUser(user).on('success', function() {
        ok(true, "Successfully created a new user.");
      }).on('error', function() {
        ok(false, "Successfully created a new user.");
      }).on('complete', loginUser);
    }

    function loginUser() {
      store.login(user).on('success', function() {
        ok(true, "Logged in new user");
      }).on('error', function() {
        ok(false, "Logged in new user");
      }).on('complete', getUserValue);
    }

    function getUserValue() {
      ok(store.isLoggedIn(), "User is currently logged in.");
      ok(store.isApplicationData(), "Store will refer to application data");
      store.get(key).on('success', function(data) {
        deepEqual(data[key], appObj, "Verify that we can see application data when logged in");
      }).on('error', function() {
        ok(false, "Verify that we can see application data when logged in");
      }).on('complete', setAppValue);
    }

    function setAppValue() {
      store.set(key, userObj).on('success', function() {
        ok(true, "Successfully set value to application data while logged in as user");
      }).on('error', function() {
        ok(false, "Successfully set value to application data while logged in as user");
      }).on('complete', setUserValue);
    }

    function setUserValue() {
      store.set(key, privateUserObj, {applevel: false}).on('success', function() {
        ok(true, "Successfully set value of user-level data while logged in as user");
      }).on('error', function() {
        ok(false, "Successfully set value of user-level data while logged in as user");
      }).on('complete', verifyAppValue);
    }
    
    function verifyAppValue() {
      store.get(key).on('success', function(data) {
        deepEqual(data[key], userObj, 'Verify application-data is the user object we set it to.');
      }).on('error', function() {
        ok(false, "Could not find value on application level.");
      }).on('complete', verifyUserValue);
    }

    function verifyUserValue() {
      store.get(key, {applevel: false}).on('success', function(data) {
        deepEqual(data[key], privateUserObj, "Verify user-level data is what we set it to.");
      }).on('error', function() {
        ok(false, "Could not find value on user-level");
      }).on('complete', start);
    }
    
    // Wait for tests
    stop();
  });

  // Test 10: Verify that we can force the store into user-level data mode. 
  test("Verify forced user-level data option.", function() {
    // Create a new store for this case using cm's properties.
    var store = new cloudmine.WebService({
      appid: cm.options.appid,
      apikey: cm.options.apikey,
      applevel: false
    });

    var key = "test_object_" + noise(11);
    var userObj = "IAMA_UserDataInUserData";
    var appObj = "IAMA_AppDataInUserData";
    var privateUserObj = "IAMA_UserLevelObject";
    var user = {
      userid: noise(5) + '@' + noise(5) + '.com',
      password: noise(5)
    };
    
    ok(!store.isLoggedIn(), "User is not currently logged in.");
    ok(!store.isApplicationData(), "Store will refer to user-level data");
    store.set(key, appObj).on('success', function() {
      ok(false, 'Could not create object while not logged in.');
    }).on('error', function() {
      ok(true, 'Could not create object while not logged in.');
    }).on('complete', verifyValue);
    
    function verifyValue() {
      store.get(key).on('success', function(data) {
        ok(false, 'Could not get object while not logged in');
      }).on('error', function() {
        ok(true, 'Could not get object while not logged in');
      }).on('complete', createUser);
    }

    function createUser() {
      store.createUser(user).on('success', function() {
        ok(true, "Successfully created a new user.");
      }).on('error', function() {
        ok(false, "Successfully created a new user.");
      }).on('complete', loginUser);
    }

    function loginUser() {
      store.login(user).on('success', function() {
        ok(true, "Logged in new user");
      }).on('error', function() {
        ok(false, "Logged in new user");
      }).on('complete', getUserValue);
    }

    function getUserValue() {
      ok(store.isLoggedIn(), "User is currently logged in.");
      ok(!store.isApplicationData(), "Store will refer to user-level data");
      store.get(key).on('success', function(data) {
        ok(false, 'Verify that the test object does not exist yet.');
      }).on('error', function() {
        ok(true, 'Verify that the test object does not exist yet.');
      }).on('complete', setUserValue);
    }

    
    function setUserValue() {
      store.set(key, privateUserObj).on('success', function() {
        ok(true, "Successfully set value of user-level data while logged in as user");
      }).on('error', function() {
        ok(false, "Successfully set value of user-level data while logged in as user");
      }).on('complete', setAppValue);
    }
    
    function setAppValue() {
      store.set(key, appObj, {applevel: true}).on('success', function() {
        ok(true, "Successfully set value to application data while logged in as user");
      }).on('error', function() {
        ok(false, "Successfully set value to application data while logged in as user");
      }).on('complete', verifyAppValue);
    }
    
    function verifyAppValue() {
      store.get(key, {applevel: true}).on('success', function(data) {
        deepEqual(data[key], appObj, 'Verify application-data is the application object we set it to.');
      }).on('error', function() {
        ok(false, "Could not find value on application level.");
      }).on('complete', verifyUserValue);
    }

    function verifyUserValue() {
      store.get(key).on('success', function(data) {
        deepEqual(data[key], privateUserObj, "Verify user-level data is what we set it to.");
      }).on('error', function() {
        ok(false, "Could not find value on user-level");
      }).on('complete', start);
    }
    
    // Wait for tests
    stop();
  });

   // Test 11: Verify that we can force the store into user-level data mode. 
  test("Verify user-level data when logged in, app data otherwise.", function() {
    // Create a new store for this case using cm's properties.
    var store = new cloudmine.WebService({
      appid: cm.options.appid,
      apikey: cm.options.apikey
    });

    var key = "test_object_" + noise(11);
    var userObj = "IAMA_UserDataInUserData";
    var appObj = "IAMA_AppDataInUserData";
    var privateUserObj = "IAMA_UserLevelObject";
    var user = {
      userid: noise(5) + '@' + noise(5) + '.com',
      password: noise(5)
    };
    
    ok(!store.isLoggedIn(), "User is not currently logged in.");
    ok(store.isApplicationData(), "Store will refer to application-level data");
    
    store.set(key, appObj).on('success', function() {
      ok(true, 'Successfully created test object');
    }).on('error', function() {
      ok(false, 'Successfully created test object');
    }).on('complete', verifyValue);
    
    function verifyValue() {
      store.get(key).on('success', function(data) {
        deepEqual(data[key], appObj, 'Set object is the application object');
      }).on('error', function() {
        ok(false, 'Could not verify value of key');
      }).on('complete', createUser);
    }

    function createUser() {
      store.createUser(user).on('success', function() {
        ok(true, "Successfully created a new user.");
      }).on('error', function() {
        ok(false, "Successfully created a new user.");
      }).on('complete', loginUser);
    }

    function loginUser() {
      store.login(user).on('success', function() {
        ok(true, "Logged in new user");
      }).on('error', function() {
        ok(false, "Logged in new user");
      }).on('complete', getUserValue);
    }
    
    function getUserValue() {
      store.get(key).on('success', function(data) {
        ok(false, 'Verify that the test object does not exist yet.');
      }).on('error', function() {
        ok(true, 'Verify that the test object does not exist yet.');
      }).on('complete', setUserValue);
    }

    function setUserValue() {
      ok(store.isLoggedIn(), "User is currently logged in.");
      ok(!store.isApplicationData(), "Store will refer to user-level data");
      store.set(key, privateUserObj).on('success', function() {
        ok(true, "Successfully set value of user-level data while logged in as user");
      }).on('error', function() {
        ok(false, "Successfully set value of user-level data while logged in as user");
      }).on('complete', setAppValue);
    }

    function setAppValue() {
      store.set(key, "2", {applevel: true}).on('success', function() {
        ok(true, "Successfully set value to application data while logged in as user");
      }).on('error', function() {
        ok(false, "Successfully set value to application data while logged in as user");
      }).on('complete', verifyUserValue);
    }

    function verifyUserValue() {
      store.get(key).on('success', function(data) {
        deepEqual(data[key], privateUserObj, "Verify user-level data is what we set it to.");
      }).on('error', function() {
        ok(false, "Could not find value on user-level");
      }).on('complete', verifyAppValue);
    }
    
    function verifyAppValue() {
      store.get(key, {applevel: true}).on('success', function(data) {
        deepEqual(data[key], "2", 'Verify application-data is the application object we set it to.');
      }).on('error', function() {
        ok(false, "Could not find value on application level.");
      }).on('complete', start);
    }
    
    // Wait for tests
    stop();
  });
});

