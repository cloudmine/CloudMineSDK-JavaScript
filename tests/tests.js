var inBrowser = true;
var base = this.window ? window : root;
var ArrayBuffer = base.ArrayBuffer;
var Buffer = base.Buffer;
var FileReader = base.FileReader;
var Uint8Array = base.Uint8Array;
var CanvasRenderingContext2D = base.CanvasRenderingContext2D;
var hasBuffers = Buffer || (Uint8Array && ArrayBuffer); 
var fs, path, crypto;

// Oh thanks QUnit team. Reordering is not a feature, it is a bug.
// Tests should run consistently in the same order every time.
QUnit.config.reorder = false;

// QUnit for Node: Redefine a few things.
if (!base.window) {
  $ = function(func) { func(); }
  cloudmine = {WebService: module.require('../js/cloudmine.js')};
  module = QUnit.module;
  inBrowser = false;
  fs = require('fs');
  path = require('path');
  crypto = require('crypto');
}


$(function() {
  var cm, cm_bad_apikey, cm_bad_appid;

  function dom(selector) {
    return document.querySelectorAll(selector);
  }

  function reverse(data) {
    if (data && typeof data == 'object' && data.length) {
      var out = Array(data.length);
      for (var i = 0; i < data.length; ++i) { out[i] = reverse(data[i]); }
      return out;
    } else if (data && typeof data == 'object') {
      var out = {};
      for (var key in data) { if (data.hasOwnProperty(key)) out[key] = reverse(data[key]); }
      return out;
    } else if (typeof data == 'string') {
      var out = "";
      for (var i = 0, c = data.length; i < data.length; ++i) { out += data[--c]; }
      return out;
    }
    return data;
  }

  function hex() { return Math.round(Math.random() * 16).toString(16); }
  function uuid() {
    var out = Array(32), i;
    out[14] = 4;
    out[19] = ((Math.round(Math.random() * 16) & 3) | 8).toString(16);
    for (i = 0; i < 14; ++i) { out[i] = hex(); }
    for (i = 15; i < 19; ++i) { out[i] = hex(); }
    for (i = 20; i < 32; ++i) { out[i] = hex(); }
    return out.join('');
  }

  function noise(count) {
    var out = [];
    while (count-- > 0) out.push('abcdefghijklmnopqrstuvwxyz123456789_'[parseInt(Math.random() * 26)]);
    return out.join('');
  }

  function fillBuffer(data) {
    var buffer;
    if (Buffer) {
      buffer = new Buffer(data, 'binary');
    } else {
      buffer = new ArrayBuffer(data.length);
      var charView = new Uint8Array(buffer);
      for (var i = 0; i < data.length; ++i) {
        charView[i] = data[i] & 0xFF;
      }
    }

    return buffer;
  }

  // Automatic cleanup (when possible)
  // Cache objects as session: [objects]
  var testObjects = {}, cleanupKey = '[[Application Data]]'
  function track(key, service) {
    var session = service.options.session_token || cleanupKey;
    if (!testObjects[session]) testObjects[session] = [];
    if (testObjects[session].indexOf(key) == -1) testObjects[session].push(key);
  }
  function cleanup(session) {
    if (typeof session == "object") session = session.options.session_token || cleanupKey;
    if (testObjects[session]) {
      cm.destroy(testObjects[session], {session_token: session == cleanupKey ? undefined : session});
    }
  }

  if (inBrowser) {
    dom('.forgetapp')[0].addEventListener('click', function() {
      if (window.localStorage) localStorage.removeItem('cm_info');
      location.reload();
    }, false);
  }

  module("JS", {
    setup: function() {
      stop();

      var info = {};
      function finishSetup() {
        if (!cm) {
          cm = new cloudmine.WebService({
            appid: info.appid || uuid(),
            apikey: info.apikey || uuid(),
            appname: 'UnitTests',
            appversion: cloudmine.WebService.VERSION
          });

          if (!inBrowser) {
            console.log("");
            console.log("Using Application ID", info.appid);
            console.log("Using API Key:", info.apikey);
          }

          cm_bad_appid = new cloudmine.WebService({ appid: uuid(), apikey: cm.options.apikey });
          cm_bad_apikey = new cloudmine.WebService({ appid: cm.options.appid, apikey: uuid() });
        }
        start();
      }

      if (inBrowser) {
        if (window.localStorage) info = JSON.parse(localStorage.getItem('cm_info') || "{}");
        if (info.appid && info.apikey) finishSetup();
        else {
          var done = false;
          var msg = dom('#key')[0];
          var appidInput = dom('#key input#cm_appid')[0];
          var apikeyInput = dom('#key input#cm_apikey')[0];
          var doneButton = dom('#key button')[0];

          function verifyOK() {
            if (appidInput.value.length == 32 && apikeyInput.value.length == 32) {
              doneButton.removeAttribute('disabled');
            } else {
              doneButton.setAttribute('disabled', true);
            }
          }

          function doneClicked() {
            if (doneButton.getAttribute('disabled') != true) {
              done = true;
              wait();
            }
          }

          function wait() {
            if (done) {
              clearInterval(wait.interval);
              wait.interval = undefined;
              document.querySelector('#key').style.display = '';
              info.appid = appidInput.value;
              info.apikey = apikeyInput.value;

              if (window.localStorage) localStorage.setItem('cm_info', JSON.stringify(info));
              finishSetup();
            }
          }

          doneButton.addEventListener('click', doneClicked, false);
          appidInput.addEventListener('keyup', verifyOK, false);
          apikeyInput.addEventListener('keyup', verifyOK, false);
          
          msg.style.display = 'block';
          wait.interval = setInterval(wait, 100);
        }
      } else if (!process.env['CLOUDMINE_APPID'] || !process.env['CLOUDMINE_APIKEY']) {
        console.log("");
        if (!process.env['CLOUDMINE_APPID']) {
          console.log("Please set environment variables: CLOUDMINE_APPID to the application id.");
        }
        if (!process.env['CLOUDMINE_APIKEY']) {
          console.log("Please set environment variables: CLOUDMINE_APIKEY to the api key of your application.");
        }
        process.exit(1);
      } else {
        info.appid = process.env['CLOUDMINE_APPID'];
        info.apikey = process.env['CLOUDMINE_APIKEY'];
        finishSetup();
      }
    },

    teardown: function() {
      if (cm) {
        for (var key in testObjects) {
          cleanup(key);
        }
        testObjects = {};
      }
    }
  });

  asyncTest('Register a new user, verify user, cloudmine-agent, and log the user in', 4, function() {
    var user = {
      email: noise(5) + '@' + noise(5) + '.com',
      password: noise(5)
    };
    
    cm.createUser(user.email, user.password).on('success', function() {
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
      cm.verify(user.email, user.password).on('error', function() {
        ok(false, "Verified that account was created.");
      }).on('success', function() {
        ok(true, "Verified that account was created.");
      }).on('complete', login);
    }

    function login() {
      cm.login({userid: user.email, password: user.password}).on('success', function(data){
        ok(data.hasOwnProperty('session_token'), 'Has session token');
      }).on('error', function() {
        ok(false, 'Could not login.');
      }).on('complete', start);
    }
  });

  asyncTest('Set an object and compare value with existing data', 2, function() {
    var key = 'test_object1';
    var value = {
      integer: 321,
      string: '321',
      array: [3, '2', 1],
      object: { '3': 2, '1': 'a' }
    };
    cm.set(key, value).on('success', function() {
      track(key, cm);
      ok(true, 'Successfully set key');
    }).on('error', function() {
      ok(false, 'Successfully set key');
    }).on('complete', verify);
    
    function verify() {
      cm.get(key).on('success', function(data) {
        deepEqual(value, data[key], 'Set then get a value. Equivilent?');
      }).on('error', function() {
        ok(false, 'Could not get key');
      }).on('complete', start);
    }
  });

  asyncTest('Create an object with update and compare with existing data', 2, function() {
    var key = 'test_object2';
    var value = {
      integer: 321,
      string: '321',
      array: [3, '2', 1],
      object: { '3': 2, '1': 'a' }
    };
    
    cm.update(key, value).on('success', function() {
      track(key, cm);
      ok(true, 'Successfully created key');
    }).on('error', function() {
      ok(false, 'Successfully created key');
    }).on('complete', finish);

    function finish() {
      cm.get(key).on('success', function(data){
        deepEqual(value, data[key], 'Update then get a value.');
      }).on('error', function() {
        ok(false, 'Could not get key.');
      }).on('complete', start);
    }
  });

  asyncTest('Create an object with set, update multiple times and compare to expected state', 13, function() {
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
          track(key, cm);
          // Kick off validation check.
          ok(true, 'Successfully updated key with: ' + jsonState);
          cm.get(key).on('error', function() {
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
    cm.set(key, state).on('success', function() {
      track(key, cm);
      ok(true, 'Successfully created test key: ' + originalState);
    }).on('error', function() {
      ok(false, 'Failed to create test key: ' + originalState);
    }).on('complete', nextTest);
  });


  asyncTest('Create an object, delete it and attempt to access post-delete', 3, function() {
    var key = 'test_object4';
    var value = {
      'A': 'B',
      'C': 'D'
    };

    cm.set(key, value).on('success', function() {
      track(key, cm);
      ok(true, 'Set key we want to delete');
    }).on('error', function() {
      ok(false, 'Set key we want to delete');
    }).on('complete', destroy);

    function destroy() {
      cm.destroy(key).on('success', function() {
        ok(true, 'Deleted key');
      }).on('error', function() {
        ok(false, 'Deleted key');
      }).on('complete', verifyDestroy);
    }

    function verifyDestroy() {
      var destroyed = false;
      cm.get(key).on(404, function() {
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
    var key = 'test_object5';
    cm.set(key, {'Britney': 'Spears'}).on('success', function() {
      track(key, cm);
      ok(true, 'Can set key on safe API Key');
    }).on('error', function() {
      ok(false, 'Can set key on safe API Key');
    }).on('complete', test1);

    var test1_401 = false;
    function test1() {
      cm_bad_apikey.get(key).on('unauthorized', function() {
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
      cm_bad_appid.get(key).on('unauthorized', function() {
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
    // Synchronous test because we are hijacking the search function
    // which searchFiles depends on.

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
    start();
  });

  asyncTest('Verify file search query builder succeeds on server', 7, function() {
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
  });


  asyncTest('Normal behavior: action use user-level data when possible.', 13, function() {
    // Create a new store for this case using cm's properties.
    var store = new cloudmine.WebService({
      appid: cm.options.appid,
      apikey: cm.options.apikey
    });

    var key = 'test_object_' + noise(11);
    var userObj = 'IAMA_UserDataInUserData';
    var appObj = 'IAMA_AppDataInUserData';
    var privateUserObj = 'IAMA_UserLevelObject';
    var user = {
      userid: noise(5) + '@' + noise(5) + '.com',
      password: noise(5)
    };
    
    ok(!store.isLoggedIn(), 'User is not currently logged in.');
    ok(store.isApplicationData(), 'Store will refer to application-level data');
    
    store.set(key, appObj).on('success', function() {
      track(key, cm);
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
      store.get(key).on('success', function(data) {
        ok(false, 'Verify that the test object does not exist yet.');
      }).on('error', function() {
        ok(true, 'Verify that the test object does not exist yet.');
      }).on('complete', setUserValue);
    }

    function setUserValue() {
      ok(store.isLoggedIn(), 'User is currently logged in.');
      ok(!store.isApplicationData(), 'Store will refer to user-level data');
      store.set(key, privateUserObj).on('success', function() {
        track(key, cm);
        ok(true, 'Successfully set value of user-level data while logged in as user');
      }).on('error', function() {
        ok(false, 'Successfully set value of user-level data while logged in as user');
      }).on('complete', setAppValue);
    }

    function setAppValue() {
      store.set(key, '2', {applevel: true}).on('success', function() {
        track(key, cm);
        ok(true, 'Successfully set value to application data while logged in as user');
      }).on('error', function() {
        ok(false, 'Successfully set value to application data while logged in as user');
      }).on('complete', verifyUserValue);
    }

    function verifyUserValue() {
      store.get(key).on('success', function(data) {
        deepEqual(data[key], privateUserObj, 'Verify user-level data is what we set it to.');
      }).on('error', function() {
        ok(false, 'Could not find value on user-level');
      }).on('complete', verifyAppValue);
    }
    
    function verifyAppValue() {
      store.get(key, {applevel: true}).on('success', function(data) {
        deepEqual(data[key], '2', 'Verify application-data is the application object we set it to.');
      }).on('error', function() {
        ok(false, 'Could not find value on application level.');
      }).on('complete', start);
    }
  });

  asyncTest('Force usage of application-level data, even if logged in.', 13, function() {
    // Create a new store for this case using cm's properties.
    var store = new cloudmine.WebService({
      appid: cm.options.appid,
      apikey: cm.options.apikey,
      applevel: true
    });

    var key = 'test_object_' + noise(11);
    var userObj = 'IAMA_UserDataInAppData';
    var appObj = 'IAMA_AppLevelObject';
    var privateUserObj = 'IAMA_UserLevelObject';
    var user = {
      userid: noise(5) + '@' + noise(5) + '.com',
      password: noise(5)
    };
    
    ok(!store.isLoggedIn(), 'User is not currently logged in.');
    ok(store.isApplicationData(), 'Store will refer to application data');
    store.set(key, appObj).on('success', function() {
      track(key, cm);
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
      store.get(key).on('success', function(data) {
        deepEqual(data[key], appObj, 'Verify that we can see application data when logged in');
      }).on('error', function() {
        ok(false, 'Verify that we can see application data when logged in');
      }).on('complete', setAppValue);
    }

    function setAppValue() {
      store.set(key, userObj).on('success', function() {
        track(key, cm);
        ok(true, 'Successfully set value to application data while logged in as user');
      }).on('error', function() {
        ok(false, 'Successfully set value to application data while logged in as user');
      }).on('complete', setUserValue);
    }

    function setUserValue() {
      store.set(key, privateUserObj, {applevel: false}).on('success', function() {
        track(key, cm);
        ok(true, 'Successfully set value of user-level data while logged in as user');
      }).on('error', function() {
        ok(false, 'Successfully set value of user-level data while logged in as user');
      }).on('complete', verifyAppValue);
    }
    
    function verifyAppValue() {
      store.get(key).on('success', function(data) {
        deepEqual(data[key], userObj, 'Verify application-data is the user object we set it to.');
      }).on('error', function() {
        ok(false, 'Could not find value on application level.');
      }).on('complete', verifyUserValue);
    }

    function verifyUserValue() {
      store.get(key, {applevel: false}).on('success', function(data) {
        deepEqual(data[key], privateUserObj, 'Verify user-level data is what we set it to.');
      }).on('error', function() {
        ok(false, 'Could not find value on user-level');
      }).on('complete', start);
    }
  });

  asyncTest('Force usage of user-level data, even if not logged in.', 13, function() {
    // Create a new store for this case using cm's properties.
    var store = new cloudmine.WebService({
      appid: cm.options.appid,
      apikey: cm.options.apikey,
      applevel: false
    });

    var key = 'test_object_' + noise(11);
    var userObj = 'IAMA_UserDataInUserData';
    var appObj = 'IAMA_AppDataInUserData';
    var privateUserObj = 'IAMA_UserLevelObject';
    var user = {
      userid: noise(5) + '@' + noise(5) + '.com',
      password: noise(5)
    };
    
    ok(!store.isLoggedIn(), 'User is not currently logged in.');
    ok(!store.isApplicationData(), 'Store will refer to user-level data');
    store.set(key, appObj).on('success', function() {
      track(key, cm);
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
      store.get(key).on('success', function(data) {
        ok(false, 'Verify that the test object does not exist yet.');
      }).on('error', function() {
        ok(true, 'Verify that the test object does not exist yet.');
      }).on('complete', setUserValue);
    }

    function setUserValue() {
      store.set(key, privateUserObj).on('success', function() {
        track(key, cm);
        ok(true, 'Successfully set value of user-level data while logged in as user');
      }).on('error', function() {
        ok(false, 'Successfully set value of user-level data while logged in as user');
      }).on('complete', setAppValue);
    }
    
    function setAppValue() {
      store.set(key, appObj, {applevel: true}).on('success', function() {
        track(key, cm);
        ok(true, 'Successfully set value to application data while logged in as user');
      }).on('error', function() {
        ok(false, 'Successfully set value to application data while logged in as user');
      }).on('complete', verifyAppValue);
    }
    
    function verifyAppValue() {
      store.get(key, {applevel: true}).on('success', function(data) {
        deepEqual(data[key], appObj, 'Verify application-data is the application object we set it to.');
      }).on('error', function() {
        ok(false, 'Could not find value on application level.');
      }).on('complete', verifyUserValue);
    }

    function verifyUserValue() {
      store.get(key).on('success', function(data) {
        deepEqual(data[key], privateUserObj, 'Verify user-level data is what we set it to.');
      }).on('error', function() {
        ok(false, 'Could not find value on user-level');
      }).on('complete', start);
    }
  });

  asyncTest('Ensure code snippets execute properly for actions', 33, function() {
    var opts = {snippet: 'reverse', params: {a: 1, b: { c: 2 }}};
    var key = 'code_snip_test_' + noise(8);
    var user = {userid: noise(32) + '@' + noise(32) + '.com', password: noise(32)};    
    
    var snipRan = false;
    cm.createUser(user).on('success', function() {
      ok(true, 'Created user for code snippet test');
    }).on('error', function() {
      ok(false, 'Created user for code snippet test');
    }).on('complete', loginUser);

    function loginUser() {
      cm.login(user).on('success', function() {
        ok(true, 'Logged in user');
      }).on('error', function() {
        ok(false, 'Logged in user');
      }).on('complete', setUserData);
    }

    var userKey = noise(32);
    function setUserData() {
      snipRan = false;
      var data = {answerToLifeTheUniverseEverything: 42, query: 'What is the ultimate question to the answer of life, the universe, and everything?', queryResult: null};
      cm.set(userKey, data, opts).on('result', function() {
        snipRan = true;
      }).on('success', function() {
        track(userKey, cm);
        ok(true, 'Set user data for code snippet test');
      }).on('error', function() {
        ok(false, 'Set user data for code snippet test');
      }).on('complete', function(data) {
        ok(snipRan, 'Snippet ran as expected');
        deepEqual(data && data.result ? reverse(data.result.success) : null, data.success, "Success data matches matches reversed output");
        updateUserData();
      });
    }

    function updateUserData() {
      snipRan = false;
      var data = {destination: 'restaurant at the end of the universe'};
      cm.update(userKey, data, opts).on('result', function() {
        snipRan = true;
      }).on('success', function() {
        track(userKey, cm);
        ok(true, 'Update user data for code snippet test');
      }).on('error', function() {
        ok(false, 'Update user data for code snippet test');
      }).on('complete', function(data) {
        ok(snipRan, 'Snippet ran as expected');
        deepEqual(data && data.result ? reverse(data.result.success) : null, data.success, "Success data matches matches reversed output");
        getUserData();
      });
    }

    function getUserData() {
      snipRan = false;
      cm.get(userKey, opts).on('result', function() {
        snipRan = true;
      }).on('success', function() {
        ok(true, 'Retrieved user data for code snippet test');
      }).on('error', function() {
        ok(false, 'Retreived user data for code snippet test');
      }).on('complete', function(data) {
        ok(snipRan, 'Snippet ran as expected');
        deepEqual(data && data.result ? reverse(data.result.success) : null, data.success, "Success data matches matches reversed output");
        searchUserData();
      });
    }

    function searchUserData() {
      snipRan = false;
      cm.search('[answerToLifeTheUniverseEverything = 42]', opts).on('result', function() {
        snipRan = true;
      }).on('success', function() {
        ok(true, 'Searched user data for code snippet test');
      }).on('error', function() {
        ok(false, 'Searched user data for code snippet test');
      }).on('complete', function(data) {
        ok(snipRan, 'Snippet ran as expected');
        deepEqual(data && data.result ? reverse(data.result.success) : null, data.success, "Success data matches matches reversed output");
        deleteUserData();
      });
    }

    function deleteUserData() {
      snipRan = false;
      cm.destroy(userKey, opts).on('result', function() {
        snipRan = true;
      }).on('success', function() {
        ok(true, 'Deleted user data for code snippet test');
      }).on('error', function() {
        ok(false, 'Deleted user data for code snippet test');
      }).on('complete', function(data) {
        ok(snipRan, 'Snippet ran as expected');
        deepEqual(data && data.result ? reverse(data.result.success) : null, data.success, "Success data matches matches reversed output");
        logoutUser();
      });
    }

    function logoutUser() {
      cleanup();
      cm.logout().on('success', function() {
        ok(true, 'Logged out user');
      }).on('error', function() {
        ok(false, 'Logged out user');
      }).on('complete', setAppData);
    }

    var appKey = noise(32);
    function setAppData() {
      snipRan = false;
      var data = {solong: 'and thanks for all the fish', arthur: 'dent'};
      cm.set(appKey, data, opts).on('result', function() {
        snipRan = true;
      }).on('success', function() {
        track(appKey, cm);
        ok(true, 'Set application data for code snippet test');
      }).on('error', function() {
        ok(false, 'Set application data for code snippet test');
      }).on('complete', function(data) {
        ok(snipRan, 'Snippet ran as expected');
        deepEqual(data && data.result ? reverse(data.result.success) : null, data.success, "Success data matches matches reversed output");
        updateAppData();
      });
    }

    function updateAppData() {
      snipRan = false;
      var data = {canTheHeartOfGoldBrewTea: 'No, but it resembles something like tea, thicker, and does not taste like tea.'};
      cm.update(appKey, data, opts).on('result', function() {
        snipRan = true;
      }).on('success', function() {
        track(appKey, cm);
        ok(true, 'Update application data for code snippet test');
      }).on('error', function() {
        ok(false, 'Update application data for code snippet test');
      }).on('complete', function(data) {
        ok(snipRan, 'Snippet ran as expected');
        deepEqual(data && data.result ? reverse(data.result.success) : null, data.success, "Success data matches matches reversed output");
        getAppData();
      });
    }

    function getAppData() {
      snipRan = false;
      cm.get(appKey, opts).on('result', function() {
        snipRan = true;
      }).on('success', function() {
        ok(true, 'Retrieved application data for code snippet test');
      }).on('error', function() {
        ok(false, 'Retreived application data for code snippet test');
      }).on('complete', function(data) {
        ok(snipRan, 'Snippet ran as expected');
        deepEqual(data && data.result ? reverse(data.result.success) : null, data.success, "Success data matches matches reversed output");
        searchAppData();
      });
    }

    function searchAppData() {
      snipRan = false;
      cm.search('[arthur = "dent"]', opts).on('result', function() {
        snipRan = true;
      }).on('success', function() {
        ok(true, 'Searched application data for code snippet test');
      }).on('error', function() {
        ok(false, 'Searched application data for code snippet test');
      }).on('complete', function(data) {
        ok(snipRan, 'Snippet ran as expected');
        deepEqual(data && data.result ? reverse(data.result.success) : null, data.success, "Success data matches matches reversed output");
        deleteAppData();
      });
    }
    
    function deleteAppData() {
      snipRan = false;
      cm.destroy(appKey, opts).on('result', function() {
        snipRan = true;
      }).on('success', function() {
        ok(true, 'Deleted application data for code snippet test');
      }).on('error', function() {
        ok(false, 'Deleted application data for code snippet test');
      }).on('complete', function(data) {
        ok(snipRan, 'Snippet ran as expected');
        deepEqual(data && data.result ? reverse(data.result.success) : null, data.success, "Success data matches matches reversed output");
        start();
      });
    }
  });

  asyncTest('Verify download integrity.', 4, function() {
    if (inBrowser) {
      expect(1);
      ok(true, 'This test currently cannot be performed in browsers for files.');
      start();
    } else {
      var uploadKey = 'test_obj_' + noise(8);
      var downloadTo = 'binary_downloaded.png'
      function hash(contents) {
        var md5 = crypto.createHash('md5');
        md5.update(contents);
        var hash = md5.digest('hex');
        return hash;
      }

      var downloadedFile;
      var apicall = cm.upload(uploadKey, "binary.png").on('success', function() {
        track(uploadKey, cm);
        ok(true, "Uploaded binary.png to " + uploadKey);
      }).on('error', function() {
        ok(false, "Uploaded binary.png to " + uploadKey);
      }).on('complete', download);

      function download() {
        cm.download(uploadKey, {filename: downloadTo}).on('error', function() {
          ok(false, 'File was downloaded from server.');
        }).on('success', function(data) {
          ok(true, 'File was downloaded from server.');
        }).on('complete', compareHashes);
      }

      function compareHashes() {
        var exists = path.existsSync(downloadTo); 
        ok(exists, 'File was downloaded to the correct file name.');
        if (exists) {
          var originalHash = hash(fs.readFileSync('binary.png', 'binary'));
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
    var uploadKey = 'test_obj_' + noise(8);
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
      fileHandle = filename = 'binary.png';
      uploadContents();
    }
    
    function uploadContents() {
      // FileReader may cause upload to abort.
      var aborted = false;
      cm.upload(uploadKey, fileHandle).on('abort', function() {
        aborted = true;
        ok(false, "File reader aborted. If you are using chrome make sure you started with flags: --allow-file-access --allow-file-access-from-files");
      }).on('error', function(data) {
        if (!aborted) ok(false, "User specified file uploaded to server");
      }).on('success', function() {
        track(uploadKey, cm);
        ok(true, "User specified file uploaded to server");
      }).on('complete', verifyUpload);
    }
    
    function verifyUpload() {
      cm.get(uploadKey).on('error', function() {
        ok(false, "File was uploaded to server");
      }).on('success', function() {
        ok(true, "File was uploaded to server");
      }).on('complete', downloadFile);
    }
    
    function downloadFile() {
      cm.download(uploadKey, {filename: "Copy of " + filename}).on('success', function() {
        ok(true, "Downloaded file to computer");
      }).on('error', function() {
        ok(false, "Downloaded file to computer");
      }).on('complete', destroyFile);
    }

    function destroyFile() {
      cm.destroy(uploadKey).on('error', function() {
        ok(false, 'Delete file from server');
      }).on('success', function() {
        ok(true, 'Delete file from server');
      }).on('complete', verifyDestroy);
    }
    
    function verifyDestroy() {
      cm.get(uploadKey).on('error', function() {
        ok(true, 'File does not exist on server');
      }).on('success', function() {
        ok(false, 'File does not exist on server');
      }).on('complete', start);
    }
  });

  asyncTest("Binary buffer upload test", 5, function() {
    if (!hasBuffers) {
      expect(1);
      ok(true, "No known binary buffers supported, skipping test.");
      start();
    } else {
      var key = 'binary_buffer_' + noise(12);
      var data = '\x01\x02\x03\x04\x05\x06\x07\x08\x09\xF1\xF2\xF3\xF4\xF5\xF6\xF7\xF8\xF9';
      var buffer = fillBuffer(data);

      var downloaded = null;
      function downloadData() {
        cm.download(key, {mode: 'buffer'}).on('error', function() {
          ok(false, 'Download unnamed binary buffer from server');
        }).on('success', function(data) {
          downloaded = fillBuffer(data[key]);
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
        cm.destroy(key).on('success', function() {
          ok(true, 'Deleted unnamed binary buffer from server.');
        }).on('error', function() {
          ok(false, 'Deleted unnamed binary buffer from server.');
        }).on('complete', start);
      }

      // Upload the binary buffer to the server. Should automatically be base64 encoded.
      cm.upload(key, buffer).on('error', function() {
        ok(false, "Upload unnamed binary buffer to server"); 
      }).on('success', function() {
        track(key, cm);
        ok(true, "Upload unnamed binary buffer to server");
      }).on('complete', downloadData);
    }
  });
  
  asyncTest("Canvas upload test", 2, function() {
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
        cm.download(key, {filename: key + ".png"}).on('success', function() {
          ok(true, "Downloaded canvas. Should be a red square with a blue square overlaid.");
        }).on('error', function() {
          ok(false, "Downloaded canvas. Should be a red square with a blue square overlaid.");
        }).on('complete', start);
      }
      
      var key = "canvas_image_" + noise(12);
      cm.upload(key, ctx).on('success', function() {
        track(key, cm);
        ok(true, 'Uploaded canvas to server');
      }).on('error', function() {
        ok(false, 'Uploaded canvas to server');
      }).on('complete', downloadCanvas);
    }
  });
  asyncTest("User update/search test with strings as parameters", 5, function(){
    var user = {
      email: noise(5) + '@' + noise(5) + '.com',
      password: noise(5)
    };

    var key = noise(10), value = noise(10),
        key2 = noise(10), value2 = noise(10);

    var nonExistingKey = noise(10), nonExistingValue = noise(10),
        nonExistingKey2 = noise(10), nonExistingValue2 = noise(10);

    function searchForNonExisting(){
      cm.searchUsers('[' + nonExistingKey + '="' + nonExistingValue + '"]')
        .on('success', function(response){
          if (Object.keys(response).length == 0){
            ok(true, 'Didn\'t find non-existing user for [' + nonExistingKey + '="' + nonExistingValue + '"]');
          }
        })
        .on('error', function(response){
          ok(false, 'Didn\'t find non-existing user for [' + nonExistingKey + '="' + nonExistingValue + '"]');
        })
        .on('complete', searchForNonExistingWithMultipleKeys);
    }

    function searchForNonExistingWithMultipleKeys(){
      cm.searchUsers('[' + nonExistingKey + '="' + nonExistingValue + '", ' + nonExistingKey2 + '="' + nonExistingValue2 + '"]')
        .on('success', function(response){
          if (Object.keys(response).length == 0){
            ok(true, 'Didn\'t find non-existing user for [' + nonExistingKey + '="' + nonExistingValue + '", ' + 
                                                             nonExistingKey2 + '="' + nonExistingValue2 + '"]');
          }
        })
        .on('error', function(response){
          ok(false, 'Didn\'t find non-existing user for [' + nonExistingKey + '="' + nonExistingValue + '", ' + 
                                                             nonExistingKey2 + '="' + nonExistingValue2 + '"]');
        })
        .on('complete', start);
    }

    function searchForExisting(){
      ok(true, 'Updated user with [' + key + '="' + value + '"]. Logging out...')
      cm.logout()
        .on('success', function(){
          cm.searchUsers('[' + key + '="' + value + '"]')
            .on('success', function(response){
              if (Object.keys(response).length == 1){
                ok(true, 'Found the user for [' + key + '="' + value + '"]');
              }
            })
            .on('error', function(response){
                ok(false, 'Found the user for [' + key + '="' + value + '"]');
            })
            .on('complete', searchForExistingWithMultipleKeys);
        });
    }

    function searchForExistingWithMultipleKeys(){
      cm.searchUsers('[' + key + '="' + value + '"]')
        .on('success', function(response){
          if (Object.keys(response).length == 1){
            ok(true, 'Found the user for [' + key + '="' + value + '", ' + key2 + '="' + value2 + '"]');
          }
        })
        .on('error', function(response){
          ok(false, 'Found the user for [' + key + '="' + value + '", ' + key2 + '="' + value2 + '"]');
        })
        .on('complete', searchForNonExisting);
    }

    function update(){
      cm.updateUser(key2, value2) 
        .on('success', function(){
          cm.updateUser(key, value)
            .on('success', searchForExisting)
        });
    }

    function login(){
      cm.login({userid: user.email, password: user.password})
      .on('success', update);
    }

    cm.createUser({userid: user.email, password: user.password})
      .on('success', login);
  });

  asyncTest("User update/search test with objects as parameters.", 5, function(){
    var user = {
      email: noise(5) + '@' + noise(5) + '.com',
      password: noise(5)
    },
    query;

    var key = noise(10), value = noise(10),
        key2 = noise(10), value2 = noise(10);

    var nonExistingKey = noise(10), nonExistingValue = noise(10),
        nonExistingKey2 = noise(10), nonExistingValue2 = noise(10);

    function searchForNonExisting(){
      query = {};
      query[nonExistingKey] = nonExistingValue;
      cm.searchUsers(query)
        .on('success', function(response){
          if (Object.keys(response).length == 0){
            ok(true, 'Didn\'t find non-existing user for {' + nonExistingKey + ': "' + nonExistingValue + '"}');
          }
        })
        .on('error', function(response){
          ok(false, 'Didn\'t find non-existing user for {' + nonExistingKey + ': "' + nonExistingValue + '"}');
        })
        .on('complete', searchForNonExistingWithMultipleKeys);
    }

    function searchForNonExistingWithMultipleKeys(){
      query = {};
      query[nonExistingKey] = nonExistingValue;
      query[nonExistingKey2] = nonExistingValue2;
      cm.searchUsers(query)
        .on('success', function(response){
          if (Object.keys(response).length == 0){
            ok(true, 'Didn\'t find non-existing user for {' + nonExistingKey + ': "' + nonExistingValue + '", ' + 
                                                             nonExistingKey2 + ': "' + nonExistingValue2 + '"}');
          }
        })
        .on('error', function(response){
          ok(false, 'Didn\'t find non-existing user for {' + nonExistingKey + ': "' + nonExistingValue + '", ' + 
                                                            nonExistingKey2 + ': "' + nonExistingValue2 + '"}');
        })
        .on('complete', start);
    }

    function searchForExisting(){
      ok(true, 'Updated user with {' + key + ': "' + value + '", ' + key2 + ': "' + value2 + '"}. Logging out...')
      cm.logout()
        .on('success', function(){
          query = {};
          query[key] = value;
          cm.searchUsers(query)
            .on('success', function(response){
              if (Object.keys(response).length == 1){
                ok(true, 'Found the user for {' + key + ': "' + value + '"}');
              }
            })
            .on('error', function(response){
              ok(false, 'Found the user for {' + key + ': "' + value + '"}');
            })
            .on('complete', searchForExistingWithMultipleKeys);
        });
    }

    function searchForExistingWithMultipleKeys(){
      query = {};
      query[key] = value;
      query[key2] = value2;
      cm.searchUsers(query)
        .on('success', function(response){
          if (Object.keys(response).length == 1){
            ok(true, 'Found the user for {' + key + ': "' + value + '", ' + key2 + ': "' + value2 + '"}');
          }
        })
        .on('error', function(response){
          ok(false, 'Found the user for {' + key + ': "' + value + '", ' + key2 + ': "' + value2 + '"}');
        })
        .on('complete', searchForNonExisting);
    }

    function update(){
      query = {};
      query[key] = value;
      query[key2] = value2;
      window.cm = cm;
      cm.updateUser(query) 
        .on('success', searchForExisting);
    }

    function login(){
      cm.login({userid: user.email, password: user.password})
      .on('success', update);
    }

    cm.createUser({userid: user.email, password: user.password})
      .on('success', login);
  });

  asyncTest("User search by ID", 2, function(){
    var user = {
      email: noise(5) + '@' + noise(5) + '.com',
      password: noise(5)
    }, 
    id;

    function search(response){
      id = response.__id__;
      cm.getUser(id)
        .on('success', function(response){
          if (Object.keys(response).length == 1){
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
      id = noise(32);
      cm.getUser(id)
        .on('success', function(response){
          ok(false, "Search for non-existent user by id, get no results");
        })
        .on('error', function(){
          ok(true, "Search for non-existent user by id, get no results");
        })
        .on('complete', start)
    }

    cm.createUser({userid: user.email, password: user.password})
      .on('success', function(response){
        search(response)
      });
  });


  asyncTest("Get all users in app", 1, function(){
    cm.allUsers()
      .on('success', function(response){
        var numberOfUsers = Object.keys(response).length;
        ok(true, numberOfUsers + " users retrieved");
      })
      .on('error', function(response){
        ok(false, "Error retrieveing users.");
      })
      .on('complete', start);
  });
});
