// QUnit for Node: Redefine a few things.
var inBrowser = true;
if (!this.window) {
  function $(func) { func(); }
  cloudmine = {WebService: module.require('../js/cloudmine.js')};
  module = QUnit.module;
  inBrowser = false;
}


$(function() {
  var FileReader = this.FileReader;
  var swfupload = this.swfupload;
  module('Common');

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
    return out.join('');
  }

  // Test 1: Register a user, then log them
  asyncTest('Create user, log in as them', 2, function() {
    var user = {
      email: noise(5) + '@' + noise(5) + '.com',
      password: noise(5)
    };
    
    cm.createUser(user.email, user.password).on('success', function() {
      ok(true, 'Created user ' + user.email + ' with password ' + user.password);
    }).on('error', function() {
      ok(false, 'Created user ' + user.email + ' with password ' + user.password);
    }).on('complete', login);

    function login() {
      cm.login({userid: user.email, password: user.password}).on('success', function(data){
        ok(data.hasOwnProperty('session_token'), 'Has session token');
      }).on('error', function() {
        ok(false, 'Could not login.');
      }).on('complete', start);
    }
  });


  // Test 2: Create an object with set(), get that key, see if they match
  asyncTest('Create object with set, get it, see if equal', 2, function() {
    var key = 'test_object1';
    var value = {
      integer: 321,
      string: '321',
      array: [3, '2', 1],
      object: { '3': 2, '1': 'a' }
    };
    
    cm.set(key, value).on('success', function() {
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

  // Test 3: Create an object with update(), get that key, see if they match
  asyncTest('Create object with update, get it, see if equal', 2, function() {
    var key = 'test_object2';
    var value = {
      integer: 321,
      string: '321',
      array: [3, '2', 1],
      object: { '3': 2, '1': 'a' }
    };
    
    cm.update(key, value).on('success', function() {
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

  // Test 4: Set an object, then update its attributes one at a time to see if they are changing
  asyncTest('Set object and test to see if update works on it', 13, function() {
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
      ok(true, 'Successfully created test key: ' + originalState);
    }).on('error', function() {
      ok(false, 'Failed to create test key: ' + originalState);
    }).on('complete', nextTest);
  });


  asyncTest('Set object, delete it, try to get it again.', 3, function() {
    var key = 'test_object4';
    var value = {
      'A': 'B',
      'C': 'D'
    };

    cm.set(key, value).on('success', function() {
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


  // Test 6: Let's fuck some shit up
  asyncTest('401, 404 errors for object queries with bad API key and App IDs', 3, function() {
    var key = 'test_object5';
    cm.set(key, {'Britney': 'Spears'}).on('success', function() {
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

  // Test 7: Search Files alters the query given, lets make sure we are building it right.
  asyncTest('Verify query building for file search', 7, function() {
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

  // Test 8: Verify buildable queries actually execute on the server.
  asyncTest('Verify built queries for file search', 7, function() {
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

  // Test 9: Verify that we can force the store into application-level data mode. 
  asyncTest('Verify forced application-level data option.', 13, function() {
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
        ok(true, 'Successfully set value to application data while logged in as user');
      }).on('error', function() {
        ok(false, 'Successfully set value to application data while logged in as user');
      }).on('complete', setUserValue);
    }

    function setUserValue() {
      store.set(key, privateUserObj, {applevel: false}).on('success', function() {
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

  // Test 10: Verify that we can force the store into user-level data mode. 
  asyncTest('Verify forced user-level data option.', 13, function() {
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
        ok(true, 'Successfully set value of user-level data while logged in as user');
      }).on('error', function() {
        ok(false, 'Successfully set value of user-level data while logged in as user');
      }).on('complete', setAppValue);
    }
    
    function setAppValue() {
      store.set(key, appObj, {applevel: true}).on('success', function() {
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

  // Test 11: Verify that we can force the store into user-level data mode. 
  asyncTest('Verify user-level data when logged in, app data otherwise.', 13, function() {
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
        ok(true, 'Successfully set value of user-level data while logged in as user');
      }).on('error', function() {
        ok(false, 'Successfully set value of user-level data while logged in as user');
      }).on('complete', setAppValue);
    }

    function setAppValue() {
      store.set(key, '2', {applevel: true}).on('success', function() {
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

  var uploadKey = 'test_obj_' + noise(8);

  // Test 12 (Node.JS): Verify that we can upload files
  asyncTest('Verify upload capability', function() {
    if (inBrowser) {
      ok(true, 'Test skipped.');
      start();
    } else {
      cm.upload(uploadKey, '../js/cloudmine.js', {contentType: 'text/cloudminetest'}).on('error', function() {
        ok(false, 'Upload cloudmine.js as ' + uploadKey);
      }).on('success', function() {
        ok(true, 'Upload cloudmine.js as ' + uploadKey);
      }).on('complete', verifyFileName);
      
      function verifyFileName() {
        cm.get(uploadKey).on('error', function() {
          ok(false, 'File was not uploaded.');
        }).on('success', function(data) {
          ok(data[key].name === 'cloudmine.js', 'File name is cloudmine.js');
          ok(data[key].content_type === 'text/cloudminetest', 'Content-type is text/cloudminetest');
        }).on('complete', start);
      }
    }
  });

  // Test 13 (Node.JS): Verify that we can download files and the file we uploaded did not get corrupted.
  asyncTest('Verify download capability', function() {
    if (inBrowser) {
      ok(true, 'Test skipped.');
      start();
    } else {
      function hash(data) {
        var md5 = require('crypto').createHash('md5');
        md5.update(contents);
        md5.digest('hex');
      }

      cm.download(uploadKey, {filename: '_tmp_cloudmine.js'}).on('error', function() {
        ok(false, 'File does not exist on server');
      }).on('success', function(data) {
        var fs = require('fs');
        var originalFile = fs.readFileSync('../js/cloudmine.js', 'utf8');
        var downloadedFile = fs.readFileSync('_tmp_cloudmine.js', 'utf8');
        var originalHash = hash(originalFile);
        ok(hash(downloadedFile) === originalHash, "Downloaded file matches content of uploaded");
        ok(hash(data[key]) === originalHash, "In memory copy matches content of uploaded");
      }).on('complete', start);
    }
  });

  // Test 14: Verify that we can upload files through the browser.
  asyncTest('DND verify upload capability', function() {
    if (!inBrowser) {
      ok(true, 'Test skipped.');
      start();
    } else {
      if (FileReader) {
        var dragContents = false;
        var elem = document.querySelector('#dnd');
        var button = elem.querySelector('button');

        function skipTest() {
          dragContents = true;
          button.removeEventListener('click', skipTest, false);
        }

        function readFile(e) {
          dragContents = e.dataTransfer.files[0];
          window.removeEventListener('drop', readFile, false);
          e.preventDefault();
        }

        function waitForDrag() {
          if (dragContents) {
            clearInterval(waitForDrag.interval);
            elem.style.display = 'none';
            uploadContents();
          }
        }

        function uploadContents() {
          if (dragContents === true) {
            ok(false, "Skipped uploading file.");
            start();
          } else {
            var aborted = false;
            // FileReader may cause upload to abort.
            cm.upload(uploadKey, dragContents, {contentType: 'text/cloudminetest'}).on('abort', function() {
              aborted = true;
              ok(false, "File reader aborted. If you are using chrome make sure you started with flags: --allow-file-access --allow-file-access-from-files");
            }).on('error', function(data) {
              if (!aborted) ok(false, "User specified file uploaded to server");
            }).on('success', function() {
              ok(true, "User specified file uploaded to server");
            }).on('complete', verifyUpload);
          }
        }
        
        function verifyUpload() {
          cm.get(uploadKey).on('error', function() {
            ok(false, "File was uploaded to server");
          }).on('success', function() {
            ok(true, "File was uploaded to server");
          }).on('complete', start);
        }

        // Wait for user input.
        button.addEventListener('click', skipTest, false);
        window.addEventListener('drop', readFile, false);
        waitForDrag.interval = setInterval(waitForDrag, 100);
        elem.style.display = 'block';
        waitForDrag();
      } else {
        ok(false, "Test harness does not test swfupload!");
        start();
      }
    }
  });

  // Test 15: Verify that we can upload and download binary data.
  var BinaryBuffer = this.Uint8Array || this.Buffer;
  asyncTest("Binary Buffer Upload Test", function() {
    if (!BinaryBuffer) {
      ok(false, "No known binary buffers supported, skipping test.");
      start();
    } else {
      var key = 'binary_buffer_' + noise(12);
      var buffer = new BinaryBuffer(32);
      for (var i = 65; i < 97; ++i) {
        buffer[i-65] = String.fromCharCode(i);
      }

      cm.upload(key, buffer).on('error', function() {
        ok(false, "Upload unnamed binary buffer to server"); 
      }).on('success', function() {
        ok(true, "Upload unnamed binary buffer to server");
      }).on('complete', verifyData);

      function verifyData() {
        cm.download(key, {mode: 'raw'}).on('error', function() {
          ok(false, 'Download unnamed binary buffer from server');
        }).on('success', function(data) {
          ok(true, 'Downloaded unnamed binary buffer from server');
          var downloaded = new BinaryBuffer(data[key]);
          var same = true;
          for (var i = 0; same && i < downloaded.length; ++i) {
            same &= downloaded[i] === buffer[i];
          }
          ok(same, "Downloaded buffer contains the same contents as the original buffer.");
        }).on('complete', deleteData);
      }

      function deleteData() {
        cm.destroy(key).on('success', function() {
          ok(true, 'Deleted unnamed binary buffer from server.');
        }).on('error', function() {
          ok(false, 'Deleted unnamed binary buffer from server.');
        }).on('complete', start);
      }
    }
  });

  // Test 16: Verify that we can download a file.
  asyncTest('DND verify download capability', function() {
    if (!inBrowser) {
      ok(true, 'Test skipped.');
      start();
    } else {
      ok(false, 'Test not implemented.');
      start();
    }
  });

  // Test 17: Verify that the file we uploaded is deleted.
  asyncTest('Delete file capability', function() {
    cm.destroy(uploadKey).on('error', function() {
      ok(false, 'File does not exist on server');
    }).on('success', function() {
      ok(true, 'File does not exist on server');
    }).on('complete', verifyDestroy);

    function verifyDestroy() {
      cm.get(uploadKey).on('error', function() {
        ok(true, 'File does not exist on server');
      }).on('success', function() {
        ok(false, 'File does not exist on server');
      }).on('complete', start);
    }
  });
});
