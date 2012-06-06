/* 
   To-do list: sample Cloudmine app

   Features: - Simple data pushing: Creating new items, updating them as "done," and deleting them using Cloudmine object storage
             - Easy and secure user management: Logging in or registering as a new user, with the session saved 
               for seven days or until the user logs out.

   Global variables: - cloudmine:       instance of Cloudmine js library
                     - todo:            object of functions for this app
                     - priority_button: prototype for custom button that sets new todo item priority, 
                                        called by todo.draw_and_prepend_item

   Cloudmine library functions implemented: login, logout, createUser, update, destroy
*/

$(document).ready(function(){
  /*
    todo will be an object of functions that makes our to-do list run
    cm will be an instance of the cloudmine.WebService library object
  */
  var todo = {}/*, cm = {};*/

  /*
    Binding UI events to buttons, and login on hitting Enter while in the password field. Focus on the email field automatically.
  */
  $('#login_button').click(function(){    todo.login_user();    });
  $('#register_button').click(function(){ todo.register_user(); });
  $('#create_button').click(function(){   todo.create_item();   });
  $('#logout_button').click(function(){   todo.logout_user();   });
  $('#login_password').keydown(function(e){ e.which == 13 && todo.login_user(); });
  $('#login_email').focus();


  /*
    Check for a session_token from a previous login, stored in a cloudmineTodoSession document cookie
    NOTE: This doesn't work in Chrome on default settings because it doesn't allow local cookies to be stored.
  */
  var check_for_session = function(){
    var cookies = document.cookie.split(';');
    for (var i in cookies){
      var cookie = cookies[i].split('=');
      if (cookie[0] == 'cloudmineTodoSession' && cookie[1] != 'none'){
        $('#login').hide();
        $('#restoring_session').show();
        return cookie[1];
      }
    }
    return null
  };

  /*
    Function to initialize the cloudmine.WebService library, we'll call this at the very end of $(document).ready
    after the todo object is defined.
  */
  var init_cloudmine = function(){

    // Set up an object with our App id and API key
    var init_vals = {
      appid: '84e5c4a381e7424b8df62e055f0b69db',
      apikey: '84c8c3f1223b4710b180d181cd6fb1df'
    }

    // Perform the check for the session cookie
    var previous_session = check_for_session();

    // If found, add that to the init_vals object
    if (previous_session){
      init_vals['session_token'] = previous_session;
    }

    // Initialize Cloudmine library using everything in init_vals
    cm = new cloudmine.WebService(init_vals);

    // If we found that cookie, let's go ahead and set up the list right away
    if (previous_session){
      todo.get_items();
    }
  }

  
  /*
    Set up the todo object with all we need to make this to-do list work dynamically with no refreshes.
    We'll mostly be using jQuery to manipulate DOM elements and our instance of the Cloudmine JS library - cm - to make all the data calls.
  */
  todo = {

    data: [ ], // This will store the JSON that makes up the list

    priority_colors: ['', '#F9B3A1', '#FBF285', '#C3DD89'], // Each item has a priority -> 1 is red, 2 is yellow, 3 is green

    selected_priority: 1, // Default priority


    /*
      User Account Management:
    */

    /*
      register_user

      Called by the Register button click on the login screen.
      It uses cm.createUser to register a new user account using the info entered in 
    */
    register_user: function(){
      var username = $('#login_email').val(),
          password = $('#login_password').val();

      $('#register_button').attr('value', 'Creating account...');
      $('#login_button, #or').hide();

      // Run the Cloudmine createUser call and chain on success and error callbacks.
      cm.createUser(username, password)
        .on('success', function(response){ 
          todo.process_registration(response, { username: username, password: password }); 
        })
        .on('error', function(data){
          todo.error('login', data.errors[0]);
          $('#register_button').attr('value', 'Register');
          $('#login_button, #or').show();
        });
    },
    
    /* 
      process_registration

      Called by todo.register_user. Logs in newly created user.
    */
    process_registration: function(response, input){
      todo.login_user(input);
    },

    /*
      login_user
      
      Called by Login button click and todo.process_registration (new user is immediately logged in after registration)
      Parameter:
        credentials: optional object containing username and password
    */
    login_user: function(credentials){
      if (credentials == undefined){
        credentials = {
          username: $('#login_email').val(),
          password: $('#login_password').val()
        };
      }
      
      // Don't actually run if one of the values is blank
      if (!credentials.username || !credentials.password){
        return;
      }

      // Alter the UI to indicate that the login request is pending
      $('#login_button').attr('value', 'Logging in...');
      $('#register_button, #or').hide();

      // Run Cloudmine login request.
      cm.login(credentials)
        .on('success', function(response){ 
          todo.process_login(response);
        })
        .on('401', function(data){
          todo.error('login', data.errors[0]);
          $('#login_button').attr('value', 'Login');
          $('#register_button, #or').show();
        });
    },
    
    /*
      process_login
      
      Called by todo.login_user. Creates a cookie with the session_token we got back from Cloudmine 
      and calls for this user's data for their to-do list.
      Parameter:
        response: response data from the server, passed in by todo.login_user
    */
    process_login: function(response){
      document.cookie = 'cloudmineTodoSession=' + response.session_token + '; expires=' + response.expires + '; path=/';
      todo.get_items();
    },

    /*
      logout_user

      Called by Logout button in the list view. Logs user out, clears session cookie.
    */
    logout_user: function(){
      cm.logout().on('success', function(){ 
        todo.process_logout(); 
      }); 
    },

    /*
      process_logout

      Called by todo.logout_user. Clears the session cookie and resets the login screen.
    */
    process_logout: function(){
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

    /*
      push_item

      Called by todo.create_item and todo.toggle_item. Pushes item data to the server (this can be creating it or updating it).
      If it's creating the item, chain on a function to draw that item and put it in the UI when the call is successful.
    */
    push_item: function(data, unique_id){
      if (unique_id == undefined){        // The unique_id will be the key for this object in Cloudmine's database.
        unique_id = new Date().getTime(); // When creating objects with Cloudmine you get to specify their key yourself.
        data = {                          // In our case, we'll use javascript's built-in new Date().getTime() to get an ID unique for the moment
          text: data.title,               // this item was created if a unique_id hasn't been specified (which means we're making a new item
          priority: data.priority,        // and not updating an existing one).
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
        callback = function(response){ todo.draw_and_prepend_item(data) }
      } else {
        callback = function() {}
      }

      /*
        Make the Cloudmine library call to send the data to the cloud, along with the unique_id

        IMPORTANT: We need to set the third parameter, which is other options, to { user: true } in order to
                   store this data privately to this user. 
      */
      cm.update(unique_id, data, { user: true })
        .on('success', callback)
        .on('error', function(){
          todo.error('list', this.data);
        });
    },

    /*
      get_items

      Called by todo.process_login. Retrieves the user's to-do items from Cloudmine and calls todo.draw_list to build the elements that display the list.
    */
    get_items: function(){
      cm.get(null).on('success', function(response){
        debugger
        // Save the response data
        todo.data = response;
        $('#login').hide();
        $('#todo, #new').show(); 
        todo.setup_priority_buttons();
        todo.draw_list(response);

        // IMPORTANT: Here we see the { user: true } flag again, because we're getting user-specific private data.
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
      todo.push_item(data);
    },

    /*
      delete_item

      Called by Delete button click on an item. Removes the item from the cloud with cm.destroy and then removes it from the UI.
      The callback on this one 
    */
    delete_item: function(key){
      cm.destroy(key, { user: true })
        .on('complete', function(){ 
          $('span[item="' + key + '"]').remove();
        })
    },

    /*
      draw_list

      takes
    */
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
          item_text, // The text that will display in the item
          todo_div, todo_checkbox, todo_delete, todo_wrapper; // DOM elements (main div, checkbox that indicates done-ness)

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

      todo.push_item({
        done: data.done
      }, data.__id__, function(){ });
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
    },

    error: function(view, message){
      $('#error_' + view).css({display: 'inline-block'}).text('Error! ' + message);
      setTimeout(function(){
        $('#error_' + view).fadeOut(500);
      }, 3500);
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

  /* 
    After everything is defined, initialize Cloudmine.
  */

  init_cloudmine();

  window.todo = todo;

});
