$(document).ready(function(){
  // Initializing the Cloudmine library requires your App ID and personal API key,
  // which you can find on your Dashboard on cloudmine.me
  var app_id = '84e5c4a381e7424b8df62e055f0b69db',
      api_key = '84c8c3f1223b4710b180d181cd6fb1df',
      login_user, register_user;

  // Binding event handlers to the login/registration buttons
  $('#login_button').click(function(){
    todo.login_user();
  });

  $('#register_button').click(function(){
    todo.register_user();
  });

  // Log the user in by default on hitting Enter
  $('#login_password').keydown(function(e){
    if (e.which == 13){
      todo.login_user();
    }
  });

  // Initializing Cloudmine library with App ID and API key
  cloudmine.init({
    app_id: app_id,
    api_key: api_key
  });


  // "todo" object wrapper for all app functions
  todo = {

    data: [ ], // Will be filled in upon login

    // Login/Registration requests: these are bound with the App ID and API key
    // that were given to the Cloudmine object upon cloudmine.init()

    // register_user additionally calls login_user upon a successful registration.
    // 

    // Send Cloudmine request to register a new user  
    register_user: function(){
      var input = {
        username: $('#login_email').val(), 
        password: $('#login_password').val()
      };
      cloudmine.createUser(input, function(response){ 
        todo.process_registration(response, input); 
      });        
    },
    // Send Cloudmine request to login as existing user    
    login_user: function(credentials){
      if (credentials == undefined){
        credentials = {
          username: $('#login_email').val(),
          password: $('#login_password').val()
        };
      }
      cloudmine.login(credentials, function(response){ 
        todo.process_login(response); 
      });
    },

    session_token: '',

    process_login: function(response){
      todo.show_list();
    },

    process_registration: function(response, input){
      todo.login_user(input);
    },

    show_list: function(){
      $('#login').hide();
      $('#todo').show();
      todo.get_items();
    },

    push_item: function(data, unique_id){
      var d = new Date();
      if (unique_id == undefined){
        unique_id = d.valueOf();
      }
      if (data == undefined){
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

      cloudmine.updateValue(unique_id, data, function(response){
        todo.handle_data(response)
        // IMPORTANT: even when logged in, data doesn't save privately under the
        // user by default. Add a fourth opt argument with user: true to save privately
      }, { user: true });
    },

    get_items: function(){
      cloudmine.getValues(null, function(response){
        // Save the response data
        todo.data = response;
        
        // Draw the list itself in the DOM
        todo.draw_list(response);
      }, { user: true })
    },

    draw_list: function(response){
      var todo_item, // Shortcut to the data for this todo item
          todo_div, todo_checkbox; // DOM elements (main div, checkbox that indicates done-ness)
      for (var item in response){
        if (item == 'forEach'){ 
          return 
        }
        todo_item = response[item];

        // Make DOM elements: list item div and checkbox for done/not done
        todo_div = $('<div class="todo_item" item="' + item + '">' + todo_item.text + '</div><br>');
        todo_checkbox = $('<input type="checkbox" item="' + item + '"/>');

        // Styling for if the item is done
        if (todo_item.done){
          todo_div.addClass('done');
          todo_checkbox.attr('checked', true);
        }
        // Prepend the checkbox to the beginning of the div element for the todo listing,
        // and give the whole thing a click function to toggle the listing's done status 
        // (just for UI's sake: easier to click than just the checkbox)
        todo_div.prepend(todo_checkbox).click(function(){
          var todo_item = todo.data[$(this).attr('item')];
          if (todo_item.done){
            todo.toggle_item(todo_item);
          } else {
            todo.toggle_item(todo_item);
          }
        });
        // Commit the element to the page.
        $('#todo').append(todo_div);
      }
    },

    toggle_item: function(todo_item){
      // Find the elements we want to alter
      var todo_div = $('div[item="' + todo_item.__id__ + '"]'), 
          todo_checkbox = $('input[item="' + todo_item.__id__ + '"]'),
          data = todo.data[todo_item.__id__];
      // UI changes: if checked off as done, set undone. And vice-versa.
      if (todo_item.done){
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
      todo.push_item(data, todo_item.__id__);
    },

  window.todo = todo;

});
