/*
   To-do list: sample CloudMine app

   Features: - Simple data pushing: Creating new items, updating them as "done," and deleting them using CloudMine object storage
             - Easy and secure user management: Logging in or registering as a new user, with the session saved
               for seven days or until the user logs out.

   Main objects in use: - cloudmine:       instance of CloudMine js library
                        - todo:            object of functions for this app

   CloudMine library functions implemented: login, logout, createUser, set, update, destroy
*/

$(document).ready(function(){
  /*
    todo will be an object of functions that makes our to-do list run
    cm will be an instance of the cloudmine.WebService library object
  */
  var todo = {}, cm = {};

  /*
    Binding UI events to buttons, and login on hitting Enter while in the password field. Focus on the email field automatically.
  */
  $('a.button').on('click', function(e){ e.preventDefault(); });
  $('a.facebook').on('click', function(){ todo.login_user('facebook'); });
  $('a.twitter').on('click', function(){ todo.login_user('twitter'); });
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
    if(window.localStorage){
      var saved = localStorage['cloudmineTodoSession'];
      if(!saved)
        return null;
      var prefs = JSON.parse(saved);
      return prefs.token;
    } else {
      var cookies = document.cookie.split(';');
      for (var i in cookies){
        var cookie = cookies[i].split('=');
        if (cookie[0] == 'cloudmineTodoSession' && cookie[1] != 'none'){
          $('#login').hide();
          $('#restoring_session').show();
          return cookie[1];
        }
      }
    }
    return null;
  };

  /*
    Function to initialize the cloudmine.WebService library, we'll call this at the very end of $(document).ready
    after the todo object is defined.
  */
  var init_cloudmine = function(){

    // Set up an object with our App id and API key
    var init_vals = {
      appid: 'd23a60e7d44f401aa75643e69899b004',
      apikey: 'f46828a750794cfb932d01f22b2c6d10'
    }

    // Perform the check for the session cookie
    var previous_session = check_for_session();

    // If found, add that to the init_vals object
    if (previous_session){
      init_vals['session_token'] = previous_session;
    }

    // Initialize CloudMine library using everything in init_vals
    cm = new cloudmine.WebService(init_vals);

    // If we found that cookie, let's go ahead and set up the list right away
    if (previous_session){
      todo.get_items();
    }
  }


  /*
    Set up the todo object with all we need to make this to-do list work dynamically with no refreshes.
    We'll mostly be using jQuery to manipulate DOM elements and our instance of the CloudMine JS library - cm - to make all the data calls.
  */
  todo = {

    data: [ ], // This will store the JSON that makes up the list

    priority_colors: ['', '#F9B3A1', '#FBF285', '#C3DD89'], // Each item has a priority -> 1 is red, 2 is yellow, 3 is green

    selected_priority: 1, // Default priority

    /*
      register_user

      Called by the Register button click on the login screen.
      It uses cm.createUser to register a new user account using the info entered in
    */
    register_user: function(){
      var userid = $('#login_email').val(),
          password = $('#login_password').val();

      $('#register_button').attr('value', 'Creating account...');
      $('#login_button, #or').hide();

      // Run the CloudMine createUser call and chain on success and error callbacks.
      cm.createUser(userid, password)
        .on('success', function(response){
          todo.process_registration(response, { userid: userid, password: password });
        })
        .on('conflict', function(data){
            todo.error('login', data.errors[0]);
        })
        .on('badrequest', function(data){
              todo.error('login', 'Please enter a valid email.');
        })
        .on('error', function(){
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
      var socialLogin = false;
      if (credentials == undefined){
        credentials = {
          userid: $('#login_email').val(),
          password: $('#login_password').val()
        };
      } else if (typeof credentials === 'string'){
        socialLogin = true;
      }

      // Alter the UI to indicate that the login request is pending
      $('#login_button').attr('value', 'Logging in...');
      $('#register_button, #or').hide();

      var login = socialLogin ? cm.loginSocial.bind(cm) : cm.login.bind(cm);

      function loginError(msg){
        $('#login_button').attr('value', 'Login');
        $('#register_button, #or').show();
        todo.error('login', msg);
      }

      // Run CloudMine login request.
      login(credentials)
        .on('success', function(data){
          var services = data.profile.__services__;
          if(services){
            console.log("linked services:", services);
            data.profile.__services__.forEach(function(service){
              $('a.auth.' + service).hide();
            });
          }
          todo.process_login(data);
        })
        .on('unauthorized', function(data){
          loginError(data.errors[0]);
        })
        .on('error', function(data){
          loginError(data.errors ? data.errors[0] : "Error Logging in");
        })
    },

    /*
      process_login

      Called by todo.login_user. Creates a cookie with the session_token we got back from CloudMine
      and calls for this user's data for their to-do list.
      Parameter:
        response: response data from the server, passed in by todo.login_user
    */
    process_login: function(response){
      if(window.localStorage){
        var save = JSON.stringify({token: response.session_token});
        localStorage.setItem('cloudmineTodoSession', save);
      }
      else {
        document.cookie = 'cloudmineTodoSession=' + response.session_token + '; expires=' + response.expires + '; path=/';
      }
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
      if(window.localStorage){
        localStorage.clear();
      } else {
        var _splice, cookies;
        // Read for session cookie
        document.cookie = 'cloudmineTodoSession=none; expires=' + new Date(0).toUTCString() + '; path=/';
      }

      // Reset everything
      $('#todo').empty().hide();
      $('#todo_header, #new').hide();
      $('#login, #or, #register_button').show();
      $('#login_button').val('Login').show();
      $('#register_button').val('Register').show();
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
      if (unique_id == undefined){        // The unique_id will be the key for this object in CloudMine's database.
        unique_id = new Date().getTime(); // When creating objects with CloudMine you get to specify their key yourself.
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
        callback = function(response){ todo.draw_item(data) }
      } else {
        callback = function() {}
      }

      // Make the CloudNine library call to send the data to the cloud, along with the unique_id

      cm.update(unique_id, data)
        .on('success', function(){
          todo.draw_item(data);
        })
        .on('unauthorized', function(data){
          todo.error('list', data.errors[0]);
        })
        .on('notfound', function(data){
          todo.error('list', data.errors[0]);
        });
    },

    /*
      get_items

      Called by todo.process_login. Retrieves all the user's to-do items from CloudMine and calls todo.draw_list to build the elements that display the list.
    */
    get_items: function(){
      // Calling the CloudMine get() function with the argument null retrieves all data available.
      cm.get(null).on('success', function(data){
        // Save the response data
        todo.data = data;
        $('#login').hide();
        $('#todo, #new').show();
        todo.setup_priority_buttons();
        todo.draw_list(data);
      });
    },

    /*
      create_item

      Sets up and validates variables for a new to-do item, then passes the data to todo.push_item. Gets the data from the input elements in the DOM
    */
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
      todo.push_item(data); // Push data to CloudMine
    },

    /*
      delete_item

      Called by Delete button click on an item. Removes the item from the cloud with cm.destroy and then removes it from the UI.
      The callback on this one
      Parameters:
        key: The item's key in the CloudMine db
    */
    delete_item: function(key){
      cm.destroy(key)
        .on('complete', function(){
          $('span[item="' + key + '"]').remove();
        })
    },

    /*
      draw_list

      Takes success data from get_items and draws the UI using todo.draw_item()
    */
    draw_list: function(data){
      $('#restoring_session').hide();
      $('#todo_header').show();

      if (!todo.is_empty_object(data)){
        $('#empty_list').hide();
      }

      $("#todo").html('');
      for (var key in data){
        var item = data[key];
        todo.draw_item(item);
      }
    },

    /*
      draw_item

      Creates the DOM elements that make up each item in the list, and binds a Click handler to it all which calls toggle_item on it.
    */
    draw_item: function(item_data){
      var item_text, // The text that will display in the item
          todo_div, todo_checkbox, todo_delete, todo_wrapper; // DOM elements (main div, checkbox that indicates done-ness)

      todo.data[item_data.__id__] = item_data;

      item_text = ''; // By default, start with an empty string.
      if (item_data.hasOwnProperty('deadline')){ // Parse how much time is left to complete this task.
        parsed_deadline = todo.parse_remaining_time(item_data.deadline.timestamp);
        if (parsed_deadline <= 0){
          item_text += '<span class="overdue">Overdue</span>'; // If time is up, put a bold "Overdue" flag on the item.
        } else {
        item_text += '<span class="due">Due in ' + parsed_deadline + ' hours.</span>'; // Else, put a subtler flag indicating the hours left to complete the task.
        }
      }
      // Build the elements
      todo_wrapper = $('<span item="' + item_data.__id__ + '"><br></span>');
      todo_div = $('<div class="todo_item"><span class="value"></span>' + item_text + '</div>');
      todo_div.find('.value').text(item_data.text); // Use $.text() to prevent script injection
      todo_checkbox = $('<input type="checkbox" />'),
      todo_delete = $('<div class="delete_button"></div>');

      // Styling for if the item is done: "done" class crosses out text and makes it lighter. Check off the checkbox, too.
      if (item_data.done){
        todo_div.addClass('done');
        todo_checkbox.attr('checked', true);
      }

      /*
        Prepend the checkbox to the div element and give the whole thing
        a click function to toggle the listing's done status.
        (This is just for UI's sake: it's easier to click the whole thing than ticking the checkbox itself.
        The CSS cursor: pointer on the item will make it clear that it's clickable)
      */
      todo_div.prepend(todo_checkbox).click(function(){
        var item_data = todo.data[$(this).parent().attr('item')];
        todo.toggle_item(item_data);
      }).css({
        background: todo.priority_colors[item_data.priority] // Give the item the color corresponding to its priority level.
      });

      // Bind click event to the delete button
      todo_delete.click(function(e){
        e.stopPropagation();
        todo.delete_item($(this).parent().parent().attr('item'))
      });

      // Commit the element to the page.
      $(todo_div).append(todo_delete);
      $(todo_wrapper).prepend(todo_div);
      $('#todo').prepend(todo_wrapper);

      // In case this is the first item added, hide the "You haven't added any items yet" message.
      $('#empty_list').hide();
    },

    /*
      setup_priority_buttons

      Called by todo.get_items. Sets up the three traffic-light buttons used to select a priority level when creating a new item.
    */
    setup_priority_buttons: function(){
      $('#priority_buttons').html('');
      var _i, pb, all_pbs = [ ];
      for (_i = 3; _i > 0; _i --){
        pb = new todo.priority_button(_i);
        $('#priority_buttons').append(pb.button);
        all_pbs.push(pb);
        if (_i == 3){
          pb.select(); // Select lower priority by default
        }
      }
      todo.all_pbs = all_pbs;
    },

    /*
      toggle_item

      Called by a Click handler defined in todo.draw_item.
      Toggles an item between done and not done, both in the UI and the CloudMine db.
      Parameters:
        data: Item data, from which this function gets its done status and its id.
    */
    toggle_item: function(data){
      var todo_div = $('span[item="' + data.__id__ + '"]').find('div'),
          todo_checkbox = $('span[item="' + data.__id__ + '"]').find('input[type="checkbox"]');
      if (data.done){
        data.done = false;
        todo_div.removeClass('done');
        todo_checkbox.attr('checked', false);
      } else {
        data.done = true;
        todo_div.addClass('done');
        todo_checkbox.attr('checked', true);
      }
      cm.update(data.__id__, { done: data.done });
    },

    /*
      create_deadline

      Called by todo.create_item. Converts a simple user input of hours into seconds from the moment it's being made
      to give its deadline a proper timestamp we can store and read later in todo.parse_remaining_time.
    */
    create_deadline: function(hours){
      var deadline;
      if (hours == ''){
        return null
      }
      deadline = new Date();
      deadline.setTime( deadline.getTime() + (hours * 3600000) );

      return deadline.getTime() / 1000;
    },

    /*
      parse_remaining_time

      Called by draw_item. This parses the hours remaining to finish a task given its deadline timestamp created by create_deadline.
    */
    parse_remaining_time: function(seconds){
      var now, deadline;
      now = new Date();
      deadline = new Date();

      // Convert back to milliseconds by multiplying by 1000
      deadline.setTime(seconds * 1000);

      return parseInt( deadline.getTime() / 3600000 - now.getTime() / 3600000);
    },

    /*
      is_empty_object

      Checks if an object is empty, because for some reason in Javascript
      empty objects are truthy while empty arrays evaluate as false ,'>/
      Parameters:
        object: The object we're checking.
    */
    is_empty_object: function(item) {
      if (item) {
        for (var k in item) {
          if (item.hasOwnProperty(k)) return false;
        }
      }
      return true;
    },

    /*
      error

      Flashes a red error message.
      Parameters:
        view: 'login' or 'list': which view is the user on? Determines which DOM element is used to show the error.
        message: The message to display, pulled straight from the CloudMine server response.
    */
    error: function(view, message){
      $('#error_' + view).css({display: 'inline-block'}).text('Error! ' + message);
      setTimeout(function(){
        $('#error_' + view).fadeOut(500);
      }, 3500);
    }
  }

  /*
    priority_button

    Constructor for the traffic-light-style buttons used to select the new item's priority.
  */
  var priority_button = function(value){
    var self = this;
    this.value = value;
    this.button = $('<div class="priority"></div>');
    this.selected = false;
    this.color = todo.priority_colors[value]
    // Bind the action the button
    $(this.button).click(function(){
      self.select();
    }).css({
      'background-image': 'url("priority_' + value + '.png")'
    });
    return this
  }

  priority_button.prototype = { // Give the priority button a couple methods for selection/deselection (works much like a radio button)
    select: function(){
      var self = this;
      todo.selected_priority = this.value;
      $(todo.all_pbs).each(function(i, pb){
        if (pb != self){
          pb.deselect();
        }
      });
      this.selected = true;
      $(this.button).css({
        'background-position': '0px -50px'
      });
      $('#new_item').css({
        'background-color': self.color
      });
    },

    deselect: function(){
      this.selected = false;
      $(this.button).css({
        'background-position': '' // Set to empty string rather than 0px 0px to keep the :hover action working.
      });
    }
  }

  todo.priority_button = priority_button // Attach the priority button object to the todo object

  /*
    After everything is defined, finally initialize CloudMine.
  */

  init_cloudmine();

// Uncomment the next line to make the todo object available globally (for testing/playing around)
//  window.todo = todo;

});
