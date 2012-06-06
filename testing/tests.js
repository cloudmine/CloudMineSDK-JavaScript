$(document).ready(function(){

  window.cm = new cloudmine.WebService({
    appid: '84e5c4a381e7424b8df62e055f0b69db',
    apikey: '84c8c3f1223b4710b180d181cd6fb1df'
  });
  window.cm_bad_apikey = new cloudmine.WebService({
    appid: '84e5c4a381e7424b8df62e055f0b69db',
    apikey: 'marc sucks lol'
  });
  window.cm_bad_appid = new cloudmine.WebService({
    appid: 'philly cheese steak',
    apikey: '84c8c3f1223b4710b180d181cd6fb1df'
  });

  var rL = function(){ // Random letter
    return 'abcdefghijklmnopqrstuvwxyz'.split('')[parseInt(Math.random() * 26)];
  }
  var rN = function(){ // Random password
    return '1234567890_'.split('')[parseInt(Math.random() * 11)];
  }

  module('Files');


  // Test 1: Register a user, then log them
  test('Create user, log in as them', function(){
    stop();

    var user = {
      email: rL() + rL() + rL() + '@' + rL() + rL() + rL() + '.com',
      password: rL() + rL() + rN() + rN() + rL() + rL() + rN()
    };
    setTimeout(function(){
      cm.createUser(user.email, user.password).on('success', function(){
        cm.login({userid: user.email, password: user.password}).on('success', function(data){
          ok(data.hasOwnProperty('session_token'), 'Has session token');
          start();
        });
      });
    }, 13);
  });


  // Test 2: Create an object with set(), get that key, see if they match

  test('Create object with set, get it, see if equal', function(){
    stop();


    setTimeout(function(){
      var key = 'test_object1',
        value = {
          integer: 321,
          string: '321',
          array: [3, '2', 1],
          object: { '3': 2, '1': 'a' }
        };
      cm.set(key, value).on('success', function(){
        cm.get(key).on('success', function(data){
          deepEqual(value, data[key], 'Set then get a value. deepEqual?');
          start();
        });
      });
    }, 13)
  });

  // Test 3: Create an object with update(), get that key, see if they match

  test('Create object with update, get it, see if equal', function(){
    stop();

    setTimeout(function(){
      var key = 'test_object2',
        value = {
          integer: 321,
          string: '321',
          array: [3, '2', 1],
          object: { '3': 2, '1': 'a' }
        };
      cm.update(key, value).on('success', function(){
        cm.get(key).on('success', function(data){
          deepEqual(value, data[key], 'Update then get a value. deepEqual?');
          start();
        });
      });
    }, 13);
  });

  // Test 4: Set an object, then update its attributes one at a time to see if they be changin

  test('Set object and test to see if update works on it', function(){
    stop();


    setTimeout(function(){
      
      var key = 'test_object3',
        value = {
          integer: 321,
          string: '321',
          array: [3, '2', 1],
          object: { '3': 2, '1': 'a' }
        },
        calls_done = 0,
        register_call = function(){
          calls_done ++;
          if (calls_done == 4){
            setTimeout(function(){ start(); }, 100);
          }
        }

      cm.set(key, value).on('success', function(){

        cm.update(key, {string: '123'}).on('success', function(){
          cm.get(key).on('success', function(data1){
            equal('123', data1[key].string, 'Updated string successfully.');
            register_call();
          });
        });
        cm.update(key, {object: {'3': 1, 'x': '1'}}).on('success', function(){
          cm.get(key).on('success', function(data2){
            deepEqual({'1': 'a', '3': 1, 'x': '1'}, data2[key].object, 'Updated object successfully.');
            register_call();
          });
        });
        cm.update(key, {array: [1, '2', 3]}).on('success', function(){
          cm.get(key).on('success', function(data3){
            deepEqual([1, '2', 3], data3[key].array, 'Updated array successfully.');
            register_call();
          });
        });
        cm.update(key, {integer: 123}).on('success', function(){
          cm.get(key).on('success', function(data4){
            equal(123, data4[key].integer, 'Updated integer successfully.');
            register_call();
          });
        });
      });
    }, 13);
  });


  test('Set object, delete it, try to get it again.', function(){
    stop();

    var key = 'test_object4',
        value = {
          'A': 'B',
          'C': 'D'
        };

    cm.set(key, value).on('success', function(){
      cm.destroy(key).on('success', function(){
        cm.get(key).on(404, function(){
          ok(true, 'Error upon trying to get deleted object');
          start();
        });
      });
    });
  });


  // Test 6: Let's fuck some shit up

  test('401, 404 errors for object queries with bad API key and App IDs', function(){
    stop();
      
    var key = 'test_object5',
        error_404 = false,
        error_401 = false,
        calls_done = 0,
        register_call = function(){
          calls_done ++;
          if (calls_done == 2){
            setTimeout(function(){ start(); }, 13);
          }
        }

    cm.set(key, {'Britney': 'Spears'});

    cm_bad_apikey.get(key).on(401, function(){
      error_401 = true;
      ok(error_401, '401 error fired correctly for apikey "marc sucks lol"');
      register_call();
    });

    cm_bad_appid.get(key).on(404, function(){
      error_404 = true;
      ok(error_404, '404 error fired correctly for appid "philly cheese steak"');
      register_call();
    });
  });
    
  // Note: I can't test the 400 error code for invalid JSON because 
  //   A) Steven parses it out before I can call it
  //   or
  //   B) Javascript bitches about it before I can call it

  

});

