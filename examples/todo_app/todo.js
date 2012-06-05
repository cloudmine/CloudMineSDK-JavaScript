// ToDo Cloudmine Sample App
// Features: - Simple data pushing: Creating new items and updating them as "done" using Cloudmine
//             backend object storage
//           - Easy user management: backend login/logout and registration service implementation
// Global variables: - cloudmine:       instance of Cloudmine js library
//                   - todo:            object of functions for this app
//                   - priority_button: prototype for custom button that sets new todo item priority, 
//                                      called by todo.draw_and_prepend_item

// Cloudmine library functions in use in this sample app:
//    login:        for logging in (email/password) and receiving a session_token which is saved in a cookie
//    registerUser: for creating a new user account (email/password)
//    updateValue:  for creating to-do items and marking them as done or deleting them

$(document).ready(function(){
  // Initializing the Cloudmine library requires your App ID and personal API key,
  // which you can find on your Dashboard on cloudmine.me
  var appid = '84e5c4a381e7424b8df62e055f0b69db',
      apikey = '84c8c3f1223b4710b180d181cd6fb1df',
      login_user, register_user, cookie, _c;

  // Binding event handlers to the login/registration buttons
  $('#login_button').click(function(){
    todo.login_user();
  });
  $('#register_button').click(function(){
    todo.register_user();
  });
  $('#create_button').click(function(){
    todo.create_item();
  });
  $('#logout_button').click(function(){
    cm.logout(todo.logout_user);
  });

  // Log the user in by default on hitting Enter
  $('#login_password').keydown(function(e){
    if (e.which == 13){
      todo.login_user();
    }
  });
  
  $('#login_email').focus();

  // Initializing Cloudmine library using App ID and API key
  cm = new cloudmine.WebService({
    appid: appid,
    apikey: apikey
  });



  // "todo" object wrapper for all app functions
  todo = {

    data: [ ], // Will be filled in upon login

    priority_colors: ['', '#F9B3A1', '#FBF285', '#C3DD89'],

    selected_priority: 1,

    // Login/Registration requests: these are bound with the App ID and API key
    // that were given to the Cloudmine object upon cloudmine.init()

    // register_user also calls login_user upon successful registration.

    // Send Cloudmine request to register a new user  
    register_user: function(){
      var input = {
        username: $('#login_email').val(), 
        password: $('#login_password').val()
      };
      $('#register_button').attr('value', 'Creating account...');
      $('#login_button, #or').hide();

      cm.createUser(input, function(response){ 
        todo.process_registration(response, input); 
      });        
    },
    // Send Cloudmine request to login as existing user
    // Optional credentials argument is for use by register_user, 
    // which logs in the newly created account automatically
    login_user: function(credentials, set_cookie){
      if (credentials == undefined){
        credentials = {
          username: $('#login_email').val(),
          password: $('#login_password').val()
        };
      }
      if (set_cookie == undefined){
        set_cookie = true;
      }
      $('#login_button').attr('value', 'Logging in...');
      $('#register_button, #or').hide();

      // Run the cm.login
      cm.login(credentials).on('success', function(response){ 
        todo.process_login(response, set_cookie); 
      });
    },

    logout_user: function(){
      var _splice, cookies;
      // Read for session cookie
      document.cookie = 'cloudmineTodoSession=none; expires=' + new Date(0).toUTCString() + '; path=/';
      // Reset everything
      $('#todo').empty().hide();
      $('#todo_header, #new').hide();
      $('#login, #or, #register_button').show();
      $('#login_button').attr('value', 'Login');
      $('#login_email, #login_password').val('');
      $('#login_email').focus();
      $('#priority_buttons').html('Priority:');
    },

    process_login: function(response, set_cookie){
      if (set_cookie){
        var seven_days = new Date();
        seven_days.setTime(seven_days.getTime() + 604800000);
        document.cookie = 'cloudmineTodoSession=' + response.session_token + '; expires=' + seven_days.toUTCString() + '; path=/';
      }
      todo.get_items();
    },

    process_registration: function(response, input){
      todo.login_user(input);
    },

    push_item: function(data, unique_id){
      var d = new Date();
      if (unique_id == undefined){
        unique_id = d.getTime();
        data = {
          text: data.title,
          priority: data.priority,
          picture: null,
          __class__: 'TBTodoItem',
          deadline: {
            __class__: 'datetime',
            timestamp: data.deadline
          },
          location: null,
          __id__: unique_id,
          done: false
        }
      }
      // updateValue(key, data, callback, opts) pushes data to the server. 
      // If it's a unique key, it creates a new object. 
      // If it already exists, it updates the object under that key.

      cm.update(unique_id, data, { user: true }).on('success', function(response){ todo.draw_and_append_item(response) });
        // IMPORTANT: even when logged in, data doesn't save privately under the
        // user by default. Add a fourth opt argument with user: true to save privately
    },

    get_items: function(){
      cm.get(null).on('success', function(response){
        // Save the response data
        todo.data = response;
        $('#login').hide();
        $('#todo, #new').show(); 
        // Set up the "New..." button to do its job
        todo.setup_priority_buttons();

        // Draw the list itself in the DOM
        todo.draw_list(response);
      }, { user: true })
    },

    create_item: function(){
      var data = {
        title: $('#new_item').val(),
        priority: todo.selected_priority,
        deadline: todo.create_deadline($('#due_in').val())
      }
      if (data.title == ''){
        return
      }


      $('#new_item').val('');
      todo.push_item(data, undefined, todo.draw_and_prepend_item);
    },

    delete_item: function(key){
      key = [ key ]; // Cloudmine expects an array of keys, but since we're just doing one it's simpler to
                     // pass it by itself and just convert it to an array in side this function.
      $('span[item="' + key + '"]').remove();
      cm.destroy(key, null, { user: true });
    },

    draw_list: function(response){
      var data; 

      if (response.success){
        response = response.success;
      }

      $('#restoring_session').hide();
      $('#todo_header').show();
       //
      // Drawing the todo items
     //
      for (var key in response){
      
        // Omit the last object in CM's data response, it's not useful to this
        if (key == 'forEach'){           
          return 
        }
        // The variable holding the data we want for this item
        data = response[key];
        todo.draw_and_prepend_item(data);
      }

    },

    draw_and_prepend_item: function(item_data){
      var todo_item, // Shortcut to the data for this todo item
          item_text, // The text that will display on the item
          todo_div, todo_checkbox, todo_delete; // DOM elements (main div, checkbox that indicates done-ness)

      console.log(item_data);

      todo.data[item_data.__id__] = item_data;
      // Make DOM elements: list item div and checkbox for done/not done

      item_text = '';
      
      if (item_data.deadline.timestamp != null){
        parsed_deadline = todo.parse_remaining_time(item_data.deadline.timestamp); 
        if (parsed_deadline <= 0){
          item_text += '<span class="overdue">Overdue</span>';
        } else {
        item_text += '<span class="due">Due in ' + parsed_deadline + ' hours.</span>';
        }
      }

      todo_wrapper = $('<span item="' + item_data.__id__ + '"><br></span>');
      todo_div = $('<div class="todo_item"><span class="value"></span>' + item_text + '</div>');
      todo_div.find('.value').text(item_data.text);
      todo_checkbox = $('<input type="checkbox" />'),
      todo_delete = $('<div class="delete_button"></div>');


      // Styling for if the item is done
      if (item_data.done){
        todo_div.addClass('done');
        todo_checkbox.attr('checked', true);
      }

      // Prepend the checkbox to the div element and give the whole thing
      // a click function to toggle the listing's done status. 
      // (just for UI's sake: easier to click than just the checkbox)
      todo_div.prepend(todo_checkbox).click(function(){
        var item_data = todo.data[$(this).parent().attr('item')];
        todo.toggle_item(item_data);
      }).css({
        background: todo.priority_colors[item_data.priority]
      });

      // Bind click event to the delete button
      todo_delete.click(function(e){
        e.stopPropagation();
        todo.delete_item($(this).parent().parent().attr('item'))
      });

      // Commit the element to the page.
      $(todo_div).append(todo_delete);
      $(todo_wrapper).prepend(todo_div); // Prepend to keep the linebreak at the end.
      $('#todo').prepend(todo_wrapper);
    },

    setup_priority_buttons: function(){
      var _i, pb, all_pbs = [ ];
      for (_i = 3; _i > 0; _i --){
        pb = new priority_button(_i);
        $('#priority_buttons').append(pb.button);
        all_pbs.push(pb);
        if (_i == 3){
          pb.select();
        }
      }
      todo.all_pbs = all_pbs;
    },

    toggle_item: function(data){
      // Find the elements we want to alter
      var todo_div = $('span[item="' + data.__id__ + '"]').find('div'), 
          todo_checkbox = $('span[item="' + data.__id__ + '"]').find('input[type="checkbox"]');
      // UI changes: if checked off as done, set undone. And vice-versa.
      if (data.done){
        data.done = false;
        todo_div.removeClass('done');
        todo_checkbox.attr('checked', false);
      } else {
        data.done = true;
        todo_div.addClass('done');
        todo_checkbox.attr('checked', true);
      }
      // Push changes to the server. Since we're reusing a key that's already in the db, 
      // it will update that object instead of creating a new one.
      todo.push_item(data, data.__id__, function(){ });
    },

    create_deadline: function(hours){
      var deadline;
      if (hours == ''){
        return null
      }
      deadline = new Date();
      deadline.setTime( deadline.getTime() + (hours * 3600000) );

      return deadline.getTime() / 1000;
    },

    parse_remaining_time: function(seconds){
      var now, deadline;
      now = new Date();
      deadline = new Date();

      // Convert back to milliseconds by multiplying by 1000
      deadline.setTime(seconds * 1000);

      return parseInt( deadline.getTime() / 3600000 - now.getTime() / 3600000);
    }
  }

  priority_button = function(value){
    var _this = this;
    this.value = value;
    this.button = $('<div class="priority"></div>');
    this.selected = false;
    this.color = todo.priority_colors[value]
    // Bind the action the button
    $(this.button).click(function(){
      _this.select();
    }).css({
      'background-image': 'url("priority_' + value + '.png")'
    });
    return this
  }

  priority_button.prototype.select = function(){
    var _this = this;
    todo.selected_priority = this.value;
    $(todo.all_pbs).each(function(i, pb){
      if (pb != _this){
        pb.deselect();
      }
    });
    this.selected = true;
    $(this.button).css({
      'background-position': '0px -50px'
    });
    $('#new_item').css({
      'background-color': _this.color
    });
  }

  priority_button.prototype.deselect = function(){
    this.selected = false;
    $(this.button).css({
      'background-position': ''
    });
  }

  window.todo = todo;


  // Read for session cookie
  cookies = document.cookie.split(';');
  for (cookie in cookies){
    _c = cookies[cookie].split('=');
    if (_c[0] == 'cloudmineTodoSession' && _c[1] != 'none'){
      $('#login').hide();
      $('#restoring_session').show();
      todo.login_user( {'session_token': _c[1]}, false);
    }
  }

});
