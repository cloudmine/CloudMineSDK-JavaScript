$(document).ready(function(){

  window.cm = new cloudmine.WebService({
    appid: '84e5c4a381e7424b8df62e055f0b69db',
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
/* LEAVE COMMENTED OUT FOR NOW TO NOT SPAM THE DB'S: IT WORKS
  test("Create user, log in as them", function(){
    expect(1);
    stop();

    var user = {
      email: rL() + rL() + rL() + '@' + rL() + rL() + rL() + '.com',
      password: rL() + rL() + rN() + rN() + rL() + rL() + rN()
    };
    setTimeout(function(){
      cm.createUser(user.email, user.password).on('success', function(){
        cm.login({username: user.email, password: user.password}).on('success', function(data){
          ok(data.hasOwnProperty('session_token'), "Has session token");
          start();
        });
      });
    }, 13);
  });
*/


  // Test 2: Create an object with set(), get that key, see if they match

  test("Create object with set, get it, see if equal", function(){
    expect(1);
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
          deepEqual(value, data[key], "Set then get a value. deepEqual?");
          start();
        });
      });
    }, 13)
  });

  // Test 3: Create an object with update(), get that key, see if they match

  test("Create object with update, get it, see if equal", function(){
    expect(1);
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
          deepEqual(value, data[key], "Update then get a value. deepEqual?");
          start();
        });
      });
    }, 13);
  });

  // Test 4: Set an object, then update its attributes one at a time to see if they be changin

  test("Set object and test to see if update works on it", function(){
    expect(4);
    stop();


    setTimeout(function(){
      
      var key = 'test_object3',
        value = {
          integer: 321,
          string: '321',
          array: [3, '2', 1],
          object: { '3': 2, '1': 'a' }
        };

      cm.set(key, value).on('success', function(){

        cm.update(key, {string: '123'}).on('success', function(){
          cm.get(key).on('success', function(data1){
            equal('123', data1[key].string, "Updated string successfully.");
          });
        });
        cm.update(key, {object: {'3': 1, 'x': '1'}}).on('success', function(){
          cm.get(key).on('success', function(data2){
            deepEqual({'1': 'a', '3': 1, 'x': '1'}, data2[key].object, "Updated object successfully.");
          });
        });
        cm.update(key, {array: [1, '2', 3]}).on('success', function(){
          cm.get(key).on('success', function(data3){
            deepEqual([1, '2', 3], data3[key].array, "Updated array successfully.");
          });
        });
        cm.update(key, {integer: 123}).on('success', function(){
          cm.get(key).on('success', function(data4){
            equal(123, data4[key].integer, "Updated integer successfully.");
            setTimeout(function(){
              start();
            }, 000);
          });
        });
      });
    }, 13);
  });

   

});

