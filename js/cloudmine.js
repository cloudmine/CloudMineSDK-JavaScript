/* CloudMine JavaScript Library v0.2 cloudmine.me | cloudmine.me/license */ 

(function() {
  /**
   * Construct a new WebService instance
   *
   * Each method on the WebService instance will return an APICall object which may be used to
   * access the results of the method called. You can chain multiple events together, with the
   * All events are at least guaranteed to have the callback signature: function(data, apicall).
   * supported events:
   *    200, 201, 400, 401, 404, 409, ok, created, badrequest, unauthorized, notfound, conflict,
   *    success, error, complete, meta, result
   * Event order: success callbacks, meta callbacks, result callbacks, error callbacks, complete
   * callbacks 
   *
   * Example:
   * var ws = new cloudmine.WebService({appid: "abc", apikey: "abc"});
   * ws.get("MyKey").on("success", function(data, apicall) {
   *    console.log("MyKey value: %o", data["MyKey"]);
   * }).on("error", function(data, apicall) {
   *    console.log("Failed to get MyKey: %o", apicall.status);
   * }).on("unauthorized", function(data, apicall) {
   *    console.log("I'm not authorized to access 'appid'");
   * }).on(404, function(data, apicall) {
   *    console.log("Could not find 'MyKey'");
   * }).on("complete", function(data, apicall) {
   *    console.log("Finished get on 'MyKey':", data);
   * });
   *
   * Refer to APICall's documentation for further information on events.
   *
   * @param {object} Default configuration for this WebService
   * @config {string} [appid] The application id for requests (Required)
   * @config {string} [apikey] The api key for requests (Required)
   * @config {boolean} [applevel] If true, always send requests to application.
   *                              If false, always send requests to user-level, trigger error if not logged in.
   *                              Otherwise, send requests to user-level if logged in.
   * @config {integer} [limit] Set the default result limit for requests
   * @config {integer} [skip] Set the default number of results to skip for requests
   * @config {boolean} [count] Return the count of results for request.
   * @config {string} [snippet] Run the specified code snippet during the request.
   * @config {string|object} [params] Parameters to give the code snippet (applies only for code snippets)
   * @config {boolean} [dontwait] Don't wait for the result of the code snippet (applies only for code snippets)
   * @config {boolean} [resultsonly] Only return results from the code snippet (applies only for code snippets)
   * @namespace cloudmine
   * @name WebService
   * @constructor
   */
  function WebService(options) {
    this.options = opts(this, options);
  }

  WebService.prototype = {
    /**
     * Get data from CloudMine.
     * Results may be affected by defaults and/or by the options parameter.
     * @param {string|string[]|null} If set, return the specified keys, otherwise return all keys. 
     * @param {object} options Override defaults set on WebService. See WebService constructor for parameters.
     * @function
     * @memberOf WebService.prototype
     */
    get: function(keys, options) {
      options = opts(this, options);
      keys = {
        keys: isArray(keys) ? keys.join(',') : keys
      };

      return new APICall({
        action: 'text',
        appid: this.options.appid,
        apikey: this.options.apikey,
        type: 'GET',
        options: options,
        query: server_params(options, keys)
      });
    },

    /**
     * Create new data, and merge existing data.
     * The data must be convertable to JSON.
     * Results may be affected by defaults and/or by the options parameter.
     * Use one of the two function signatures:
     * @param {object} key An object hash where the top level properties are the keys.
     * @param {object} options Override defaults set on WebService. See WebService constructor for parameters.
     *    - OR -
     * @param {string|null} key The key to affect. If given null, a random key will be assigned.
     * @param {string|number|object} value The value of the object
     * @param {object} options Override defaults set on WebService. See WebService constructor for parameters.
     * @return An APICall instance for the web service request used to attach events.
     *
     * @function
     * @memberOf WebService.prototype
     */
    update: function(key, value, options) {
      if (isObject(key)) options = value;
      else {
        if (!key) key = uuid();
        var out = {};
        out[key] = value;
        key = out;
      }
      options = opts(this, options);
      
      return new APICall({
        action: 'text',
        type: 'POST',
        appid: this.options.appid,
        apikey: this.options.apikey,
        options: options,
        query: server_params(options),
        data: JSON.stringify(key)
      });
    },

    /**
     * Create or overwrite existing objects in CloudMine with the given key or keys.
     * The data must be convertable to JSON.
     * Results may be affected by defaults and/or by the options parameter.
     * Use one of the two function signatures:
     * @param {object} key An object hash where the top level properties are the keys.
     * @param {object} options Override defaults set on WebService. See WebService constructor for parameters.
     *   -OR-
     * @param {string|null} key The key to affect. If given null, a random key will be assigned.
     * @param {string|number|object} The object to store. 
     * @return An APICall instance for the web service request used to attach events.
     *
     * @function
     * @memberOf WebService.prototype
     */
    set: function(key, value, options) {
      if (isObject(key)) options = value;
      else {
        if (!key) key = uuid();
        var out = {};
        out[key] = value;
        key = out;
      }
      options = opts(this, options);

      return new APICall({
        action: 'text',
        type: 'PUT',
        appid: this.options.appid,
        apikey: this.options.apikey,
        options: options,
        query: server_params(options),
        data: JSON.stringify(key)
      });
    },

    /**
     * Destroy one or more keys on the server.
     * If given null and options.all is true, delete all objects on the server.
     * Results may be affected by defaults and/or by the options parameter.
     * @param {string|string[]|null} keys The keys to delete on the server.
     * @param {object} options Override defaults set on WebService. See WebService constructor for parameters.
     * @return An APICall instance for the web service request used to attach events.
     *
     * @function
     * @memberOf WebService.prototype
     */
    destroy: function(keys, options) {
      options = opts(this, options);
      if (keys == null && options.all === true) keys = {all: true};
      else keys = {keys: (isArray(keys) ? keys.join(',') : keys)}

      return new APICall({
        action: 'data',
        type: 'DELETE',
        appid: this.options.appid,
        apikey: this.options.apikey,
        options: options,
        query: server_params(options, keys)
      });
    },

    /**
     * Search CloudMine for text objects
     * Results may be affected by defaults and/or by the options parameter.
     * @param {string} query Query parameters to search for.
     * @param {object} options Override defaults set on WebService. See WebService constructor for parameters.
     * @return An APICall instance for the web service request used to attach events.
     *
     * @function
     * @memberOf WebService.prototype
     */
    search: function(query, options) {
      options = opts(this, options);
      query = {q: query != null ? query : ""}
      return new APICall({
        action: 'search',
        type: 'GET',
        appid: this.options.appid,
        apikey: this.options.apikey,
        query: server_params(options, query),
        options: options
      });
    },

    /**
     * Search CloudMine explicitly querying for files.
     * Note: This does not search the contents of files.
     * Results may be affected by defaults and/or by the options parameter.
     * @param {string} query Additional query parameters to search for.
     * @param {object} options Override defaults set on WebService. See WebService constructor for parameters.
     * @return An APICall instance for the web service request used to attach events.
     *
     * @function
     * @memberOf WebService.prototype
     */
    searchFiles: function(query, options) {
      query = query || "";
      var term = '[__type__ = "file"';
      if (query.match(/^\[(.*?)\](.*)/)) {
        var fields = RegExp.$1;
        if (fields.length > 0) term += ", " + fields;
        term += "]" + RegExp.$2;
      } else {
        if (query.length > 0) term += "]." + query;
        else term += ']';
      }

      return this.search(term, options);
    },

    /**
     * Upload a file stored in CloudMine.
     *
     * @param {string} key The binary file's object key.
     * @param {File|string} file FileAPI: A HTML5 FileAPI File object, Node.js: The filename to upload.
     * @param {object} options Override defaults set on WebService. See WebService constructor for parameters.
     * @config {string} [mode] Force upload behavior, even if the client doesn't support it. "fileapi", "node", "swf"
     * @return An APICall instance for the web service request used to attach events.
     *
     * @function
     * @memberOf WebService.prototype
     */
    upload: function(key, file, options) {
      options = opts(this, options);
      if (!key) key = uuid();

      
      // Warning: may not necessarily use ajax to perform upload.
      var apicall = new APICall({
        action: 'binary/' + key,
        type: 'post',
        later: true,
        options: options,
        appid: options.appid,
        apikey: options.apikey,
        processResponse: APICall.basicResponse
      });

      // Prepare given data.
      // TODO:
      //   FileAPI: Support Blob, File, FileReader.
      //   Primitive Arrays: Support arrays like UInt32Array, etc.
      //   Canvas: Need to get at the binary data from it and support it.
      //   Node.JS: Support Buffers, Arrays, Specify by file name.

      // Extract the data from the file first before uploading.
      if (file instanceof File) {
        var reader = new FileReader();
        reader.onload = function(e) {
          apicall.setData(e.target.result).done();
        };
        reader.readAsBinaryString(file);
      } else if (file instanceof Blob) {
        // Blob Builder!
      } else if (file instanceof ArrayBufferView) {
        // Handle the primitive array types (Uint32Array, Int32Array, Float32Array, etc).
      } else {
        // Use the CanvasImageData instead.
        if (file instanceof CanvasRenderingContext2D) file = file.getImageData();

        if (file instanceof CanvasImageData) {
        }
      }

      return apicall;
    },

    /**
     * Download a file stored in CloudMine.
     * WARNING: Experimental, behavior subject to change.
     *
     * @param {string} key The binary file's object key.
     * @param {object} options Override defaults set on WebService. See WebService constructor for parameters.
     * @config {string} [mode] Force download behavior, even if the client doesn't support it. "node", "iframe", "raw"
     * @return An APICall instance for the web service request used to attach events.
     *
     * @function
     * @memberOf WebService.prototype
     */
    download: function(key, options) {

      // If we aren't given a mode, download the file directly to the user's computer.
      var processor = (ajax == NodeAJAX ? APICall.nodeDownload : APICall.iframeDownload);
      if (options.mode === 'node') processor = APICall.nodeDownload;
      else if (options.mode === 'raw') processor = APICall.basicResponse;

      options = opts(this, options);
      options.query = {force_download: true};
      return new APICall({
        action: 'binary/' + key,
        type: 'GET',
        later: true,
        options: options,
        appid: options.appid,
        apikey: options.apikey,
        key: key,
        processResponse: processor
      });
    },


    /**
     * Create a new user.
     * Use one of the two function signatures:
     * @param {object} user An object with a userid and password field.
     * @param {object} options Override defaults set on WebService. See WebService constructor for parameters.
     *   -OR-
     * @param {string} user The userid to login as.
     * @param {string} password The password to login as.
     * @param {object} options Override defaults set on WebService. See WebService constructor for parameters.
     * @return An APICall instance for the web service request used to attach events.
     *
     * @param {object} options Override defaults set on WebService. See WebService constructor for parameters.
     * @function
     * @memberOf WebService.prototype
     */
    createUser: function(user, password, options) {
      if (isObject(user)) options = password;
      else user = {userid: user, password: password};
      options = opts(this, options);
      options.applevel = true;
      var payload = JSON.stringify({
        email: user.userid,
        password: user.password
      });
      return new APICall({
        action: 'account/create',
        type: 'POST',
        appid: this.options.appid,
        apikey: this.options.apikey,
        options: options,
        processResponse: APICall.basicResponse,
        data: payload
      });
    },

    /**
     * Change a user's password
     * Use one of the two function signatures:
     * @param {object} user An object with userid, password, and oldpassword fields.
     * @param {object} options Override defaults set on WebService. See WebService constructor for parameters.
     *   -OR-
     * @param {string} user The userid to change the password.
     * @param {string} oldpassword The existing password for the user.
     * @param {string} password The new password for the user.
     * @param {object} options Override defaults set on WebService. See WebService constructor for parameters.
     * @return An APICall instance for the web service request used to attach events.
     *
     * @function
     * @memberOf WebService.prototype
     */
    changePassword: function(user, oldpassword, password, options) {
      if (isObject(user)) options = oldpassword;
      else user = {userid: user, oldpassword: oldpassword, password: password};
      options = opts(this, options);
      options.applevel = true;

      var payload = JSON.stringify({
        password: user.password
      });
      
      return new APICall({
        action: 'account/password/change',
        type: 'POST',
        appid: this.options.appid,
        apikey: this.options.apikey,
        data: payload,
        options: options,
        processResponse: APICall.basicResponse,
        headers: {
          Authorization: "Basic " + (base64.encode(user.userid + ":" + user.oldpassword))
        }
      });
    },

    /**
     * Initiate a password reset request.
     * @param {string} userid The userid to send a reset password email to.
     * @param {object} options Override defaults set on WebService. See WebService constructor for parameters.
     * @return An APICall instance for the web service request used to attach events.
     *
     * @function
     * @memberOf WebService.prototype
     */
    resetPassword: function(userid, options) {
      options = opts(this, options);
      options.applevel = true;
      var payload = JSON.stringify({
        email: userid
      });

      return new APICall({ 
        action: 'account/password/reset',
        type: 'POST',
        appid: this.options.appid,
        apikey: this.options.apikey,
        options: options,
        processResponse: APICall.basicResponse,
        data: payload
      });
    },

    /**
     * Change the password for an account from the token received from password reset.
     * @param {string} token The token for password reset. Usually received by email.
     * @param {string} newPassword The password to assign to the user.
     * @param {object} options Override defaults set on WebService. See WebService constructor for parameters.
     * @return An APICall instance for the web service request used to attach events.
     *
     * @function
     * @memberOf WebService.prototype
     */
    confirmReset: function(token, newPassword, options) {
      options = opts(this, options);
      options.applevel = true;
      var payload = JSON.stringify({
        password: newPassword
      });

      return new APICall({
        action: "account/password/reset/" + token,
        type: 'POST',
        appid: this.options.appid,
        apikey: this.options.apikey,
        data: payload,
        processResponse: APICall.basicResponse,
        options: options
      });
    },

    /**
     * Login as a user to access user-level data.
     * Use one of the two function signatures:
     * @param {object} user An object hash with userid and password fields.
     * @param {object} options Override defaults set on WebService. See WebService constructor for parameters.
     *   -OR-
     * @param {string} user The user to login as
     * @param {string} password The password for the user
     * @param {object} options Override defaults set on WebService. See WebService constructor for parameters.
     * @return An APICall instance for the web service request used to attach events.
     *
     * @function
     * @memberOf WebService.prototype
     */
    login: function(user, password, options) {
      if (isObject(user)) options = password;
      else user = {userid: user, password: password};
      // Wipe out existing login information.
      this.options.userid = null;
      this.options.session_token = null;
      options = opts(this, options);
      options.applevel = true;

      var self = this;
      return new APICall({
        action: 'account/login',
        type: 'POST',
        appid: this.options.appid,
        apikey: this.options.apikey,
        options: options,
        headers: {
          Authorization: "Basic " + (base64.encode("" + user.userid + ":" + user.password))
        },
        processResponse: APICall.basicResponse
      }).on('success', function(data) {
        self.options.userid = data.userid;
        self.options.session_token = data.session_token;
      });
    },

    /**
     * Logout the current user.
     * @param {object} options Override defaults set on WebService. See WebService constructor for parameters.
     * @return An APICall instance for the web service request used to attach events.
     *
     * @function
     * @memberOf WebService.prototype
     */
    logout: function(options) {
      options = opts(this, options);
      options.applevel = true;

      var token = this.options.session_token;
      this.options.userid = null;
      this.options.session_token = null;

      return new APICall({
        action: 'account/logout',
        type: 'POST',
        appid: this.options.appid,
        apikey: this.options.apikey,
        processResponse: APICall.basicResponse,
        headers: {
          'X-CloudMine-SessionToken': token
        },
        options: options
      });
    },

    /**
     * Verify if the given userid and password is valid.
     * Use one of the two function signatures:
     * @param {object} user An object with userid and password fields.
     * @param {object} options Override defaults set on WebService. See WebService constructor for parameters.
     *   -OR-
     * @param {string} user The userid to login
     * @param {string} password The password of the user to login
     * @param {object} options Override defaults set on WebService. See WebService constructor for parameters.
     * @return An APICall instance for the web service request used to attach events.
     *
     * @function
     * @memberOf WebService.prototype
     */
    verify: function(user, password, options) {
      if (isObject(user)) opts = password;
      else user = {userid: user, password: password};
      options = opts(this, options);
      options.applevel = true;
      
      return new APICall({
        url: 'account',
        type: options.method || 'POST',
        appid: this.options.appid,
        apikey: this.options.apikey,
        processResponse: APICall.basicResponse,
        headers: {
          Authorization: "Basic " + (base64.encode(user.userid + ":" + user.password))
        },
        options: options
      });
    },

    /**
     * Return true if the user is logged in, false otherwise.
     *
     * @function
     * @memberOf WebService.prototype
     */
    isLoggedIn: function() {
      return !!this.options.session_token;
    },

    /**
     * Get the current userid
     * @return The logged in userid, if applicable.
     *
     * @function
     * @memberOf WebService.prototype
     */
    getUserID: function() {
      return this.options.userid;
    },

    /**
     * Get the current session token.
     * @return The current session token, if logged in.
     *
     * @function
     * @memberOf WebService.prototype
     */
    getSessionToken: function() {
      return this.options.session_token;
    },

    /**
     * Get a default option that is sent to the server.
     * @param {string} option A default parameter to send to the server.
     * @return The value of the default parameter.
     */
    getOption: function(option) {
      return (valid_params[option] ? this.options[option] : null);
    },
    
    /**
     * Set a default option that is sent to the server
     * @param {string} option A default parameter to send to the server.
     * @param {string} value The value of the option to set.
     * @return true if the option was set, false for invalid options.
     */
    setOption: function(option, value) {
      if (valid_params[option]) {
        this.options[option] = value;
        return true;
      }
      return false;
    },
    
    /**
     * Set the application or user-level data mode for this store.
     * @param {boolean|undefined} If true, this store will only operate in application data.
     *                            If false, this store will only operate in user-level data.
     *                            If null/undefined, this store will use user-level data if logged in,
     *                            application data otherwise.
     */
    useApplicationData: function(state) {
      this.options.applevel = (state === true || state === false) ? state : undefined;
    },

    /**
     * Determine if this store is using application data.
     * @return true if this store is using application data, false if is using user-level data.
     */
    isApplicationData: function() {
      if (this.options.applevel === true || this.options.applevel === false) return this.options.applevel;
      return this.options.session_token == null;
    }
  };
  
  /**
   * WebService will return an instance of this class that should be used to interact with
   * the API. Upon completion of the AJAX call, this object will fire the event handlers based on
   * what were attached.
   *
   * You may chain event creation.
   *
   * Note: It is recommended to avoid referring directly to the ajax implementation used by this
   *       function. Depending on environment, features on it may vary since this library only
   *       requires a small subset of jQuery-like AJAX functionality.
   *
   * Event firing order:
   *    Successes: HTTP Code String, HTTP Code Number, 'success'
   *    Meta: 'meta' - This is for operations that can write meta data.
   *    Result: 'result' - This is results from code snippets if used.
   *    Errors: HTTP Code String, HTTP Code Number, 'error'
   *
   * Event callback signatures:
   *    HTTP Codes: function(keys, responseObject, statusCode)
   *    'error': function(keys, responesObject)
   *    'success': function(keys, responseObject)
   *    'meta': function(keys, responseObject)
   *    'result: function(keys, responseObject)
   * @class
   * @name APICall
   */
  function APICall(config) {
    config = merge({}, defaultConfig, config);
    this._events = {};

    // Fields that are available at the completion of the api call.
    this.additionalData = config.callbackData;
    this.contentType = config.contentType;
    this.data = null;
    this.hasErrors = false;
    this.requestData = config.data;
    this.requestHeaders = {
      'X-CloudMine-ApiKey': config.apikey,
      'X-CloudMine-Agent': 'JS/0.2',
      'Content-Type': config.contentType
    };
    this.responseHeaders = {};
    this.responseText = null;
    this.status = null;
    this.type = config.type || 'GET';
    
    // Build the URL and headers
    var query = (config.query ? ("?" + stringify(config.query)) : "");
    var root = '/', session = config.options.session_token, applevel = config.options.applevel;
    if (applevel === false || (applevel !== true && session != null)) {
      root = '/user/';
      if (session != null) this.requestHeaders['X-CloudMine-SessionToken'] = session;
    }
    config.headers = merge(this.requestHeaders, config.headers);
    this.url = [apiroot, "/v1/app/", config.appid, root, config.action, query].join("");
    
    var self = this;
    config.complete = function(xhr) {
      var data = xhr.responseText;
      self.status = xhr.status;
      self.responseText = data;
      each(xhr.getAllResponseHeaders().split('\n'), function(item) {
        var index = (item.indexOf(':'));
        if (index > 0) self.responseHeaders[item.substring(0, index)] = item.substring(index + 2);
      });

      // If we can parse the data as JSON or store the original data.
      try {
        self.data = JSON.parse(data || "{}");
      } catch (e) {
        self.data = data;
      }

      // Parse the response only if a safe status
      if (self.status >= 200 && self.status < 300) {
        // Preprocess data coming in to hash-hash: [success/errors].[httpcode]
        data = config.processResponse.call(self, self.data, xhr, self);
      } else {
        data = {errors: {}};
        if (isString(self.data)){
          self.data = { errors: [ self.data ] } // This way, we can rely on this structure data[statuscode].errors to always be an Array of one or more errors
        }
        data.errors[self.status] = self.data;
      }

      // Trigger events from static context.
      APICall.complete(self, data);
    }

    // Let script continue before triggering ajax call
    if (!config.later && config.async) {
      setTimeout(function() {
        self.xhr = ajax(self.url, config);
      }, 1);
    } else {
      this._config = config;
    }
  }

  APICall.prototype = {
    /**
     * Attach an event listener to this APICall object.
     * @param eventType {String|number} The event to listen to. Can be an http code as number or string,
     *                                  success, meta, result, error.
     * @param callback {Function} Callback to call upon event trigger.
     * @param context {Object} Context to call the callback in.
     * @return The current APICall object
     * @function
     * @memberOf APICall.prototype
     */
    on: function(eventType, callback, context) {
      if (isFunction(callback)) {
        context = context || this;
        if (!this._events[eventType]) this._events[eventType] = [];

        // normal callback not called.
        var self = this;
        this._events[eventType].push([callback, context, function() {
          self.off(eventType, callback, context);
          callback.apply(this, arguments);
        }]);
      }
      return this;
    },

    /**
     * Trigger an event on this APICall object. This will call all event handlers in order.
     * @param event {String|number} The event to trigger.
     * @params All parameters following event will be sent to the event handlers.
     * @return The current APICall object
     * @function
     * @memberOf APICall.prototype
     */
    trigger: function(event/*, arg1...*/) {
      var events = this._events[event];
      
      if (events != null) {
        var args = slice(arguments, 1);
        each(events, function(event) {
          event[2].apply(event[1], args);
        });
      }
      return this;
    },

    /**
     * Remove event handlers.
     * Event handlers will be removed based on the parameters given. If no parameters are given, all
     * event handlers will be removed.
     * @param eventType {String|number} The event type which can be an http code as number or string,
     *                                  or can be success, error, meta, result.
     * @param callback {function} The function that was used to create the callback.
     * @param context {Object} The context to call the callback in.
     * @return The current APICall object
     * @function
     * @memberOf APICall.prototype
     */
    off: function(eventType, callback, context) {
      if (eventType == null && callback == null && context == null) {
        this._events = {};
      } else if (eventType == null) {
        each(this._events, function(value, key, collection) {
          collection._events[key] = removeCallbacks(value, callback, context);
        });
      } else {
        this._events[eventType] = removeCallbacks(this._events[eventType], callback, context);
      }
      return this;
    },

    /**
     * Aborts the current connection. This is ineffective for running synchronous calls or completed
     * calls. Synchronous calls can be achieved by setting async to false in WebService.
     * @return The current APICall object
     * @function
     * @memberOf APICall.prototype
     */
    abort: function() {
      if (!this._config && this.xhr) {
        this.xhr.abort();
        this.xhr = undefined;
        delete this.xhr;
      }
      return this;
    },

    /**
     * Set data to send to the server. This is ineffective for running ajax calls.
     * @return The current APICall object
     * @function
     * @memberOf APICall.prototype
     */
    setData: function(data) {
      if (!this.xhr && this._config) {
        this._config.data = data;
      }
      return this;
    },

    /**
     * If a synchronous ajax call is done (via setting: options.async = false), you must call this function
     * after you have attached all your event handlers. You should not attach event handlers after this
     * is called.
     * @function
     * @memberOf APICall.prototype
     */
    done: function() {
      if (!this.xhr && this._config) {
        this.xhr = ajax(this.url, this._config);
        this._config = undefined;
        delete this._config;
      }
      return this;
    }
  };

  // Complete the API Call.
  APICall.complete = function(apicall, data) {
    // Success results may have errors for certain keys
    if (data.errors) apicall.hasErrors = true;

    // Clean up temporary state.
    if (apicall._config) {
      apicall._config = undefined;
      delete apicall._config;
    }
    if (apicall.xhr) {
      apicall.xhr = undefined;
      delete apicall.xhr;
    }

    // Data has been processed by this point and should exist in success, errors, meta, or results hashes.
    // Event firing order: http status (e.g. ok, created), http status (e.g. 200, 201), success, meta, result, error.
    if (data.success) {
      // Callback signature: function(keys, response, statusCode)
      if (httpcode[apicall.status]) apicall.trigger(httpcode[apicall.status], data.success, apicall, apicall.status);
      apicall.trigger(apicall.status, data.success, apicall, apicall.status);

      // Callback signature: function(keys, response);
      apicall.trigger('success', data.success, apicall);
    }

    // Callback signature: function(keys, response)
    if (data.meta) apicall.trigger('meta', data.meta, apicall);

    // Callback signature: function(keys, response)
    if (data.result) apicall.trigger('result', data.result, apicall);

    // Errors needs to fire groups of errors depending on code result.
    if (data.errors) {
      // Callback signature: function(keys, reponse, statusCode)
      for (var k in data.errors) {
        if (httpcode[k]) apicall.trigger(httpcode[k], data.errors[k], apicall, k);
        apicall.trigger(k, data.errors[k], apicall, k);
      }

      // Callback signature: function(keys, response)
      apicall.trigger('error', data.errors, apicall);
    }

    // Callback signature: function(responseData, response)
    apicall.trigger('complete', data, apicall);      
  }

  // Use this for standard cloudmine text responses that have success/errors/meta/result fields.
  APICall.textResponse = function(data, xhr, response) {
    var out = {};
    if (data.success || data.errors || data.meta || data.result) {
      if (data.count != null) response.count = data.count;
      if (!isEmptyObject(data.success)) out.success = data.success;
      if (!isEmptyObject(data.meta)) out.meta = data.meta;
      if (!isEmptyObject(data.result)) out.result = data.result;
      if (!isEmptyObject(data.errors)) {
        out.errors = {};
        for (var k in data.errors) {
          var error = data.errors[k];
          if (!out.errors[error.code]) out.errors[error.code] = {}
          out.errors[error.code][k] = {errors: [ error ]};
        }
      }

      // At least guarantee a success callback
      if (isEmptyObject(out)) out.success = {};
    } else {
      // Non-standard response. Just pass back the data we were given.
      out = {success: data};
    }

    return out;
  };

  // Use this if you know the response is not a standard cloudmine text response.
  // E.g. Binary response.
  APICall.basicResponse = function(data, xhr, response) {
    var out = {success: {}};
    out.success = data;
    return out;
  };

  APICall.nodeDownload = function(data, xhr, config) {
    var out = {success: {}};
    // TODO: Write file out to file system.
    // out.success[config.key] = filehandle;
    return out;
  }

  APICall.iframeDownload = function(data, xhr, config) {
    var out = {success: {}};
    // TODO: Add a hidden iframe to document, download file, remove iframe.
    // out.success[config.key] = iframe
    return out;
  }

  /**
   * Internal minimal Node.js jQuery.ajax adapter.
   * @function
   * @private
   * @param {String} uri 
   */
  
  function NodeAJAX(uri, config) {
    config = config || {};
    this.status = 400;
    this.responseText = [];
    this._headers = {};

    // disable connection pooling
    // disable chunked transfer-encoding which nginx doesn't support
    var opts = url.parse(uri);
    opts.agent = false;
    opts.method = config.type;
    opts.headers = config.headers || {};

    // Preprocess data if it is JSON data.
    if (isObject(config.data) && config.processData) {
      config.data = JSON.stringify(config.data);
    }

    // Attach a content-length
    if (isArray(config.data)) opts.headers['content-length'] = Buffer.byteLength(config.data);
    else if (isString(config.data)) opts.headers['content-length'] = config.data.length;
    
    // Fire request.
    var self = this, cbContext = config.context || this;
    this._request = (opts.protocol === "http:" ? http : https).request(opts, function(response) {
      response.setEncoding('utf8');

      response.on('data', function(chunk) {
        self.responseText.push(chunk);
      });

      response.on('close', function() {
        response.emit('end');
      });

      response.on('end', function() {
        self._headers = stringify(response.headers);
        self.status = response.statusCode;
        var textStatus = null;

        // Process data if necessary.
        var data = self.responseText = self.responseText.join('');
        if (config.dataType == 'json' || (config.dataType != 'text' && response.headers['content-type'].match(/\bapplication\/json\b/i))) {
          try {
            data = JSON.parse(data);
          } catch (e) {
            textStatus = 'parsererror';
          }
        }

        
        if (self.status >= 200 && self.status < 300) {
          if (config.success) config.success.call(cbContext, data, 'success', self);
        } else if (config.error) {
          config.error.call(cbContext, self, 'error', self.responseText);
        }
        if (config.complete) config.complete.call(cbContext, self, self.status);
      });
    });

    this._request.on('error', function(e) {
      self.status = e.status;
      self.responseText = e.message;
      if (config.error) config.error.call(cbContext, self, 'error', e.message);
      if (config.complete) config.complete.call(cbContext, self, 'error');
    });

    this._request.end(config.data);
  }

  NodeAJAX.prototype = {
    getResponseHeader: function(header) {
      return this._headers[header];
    },
    
    getAllResponseHeaders: function() {
      return stringify(this._headers, ': ', '\n');
    },

    abort: function() {
      if (this._request) {
        this._request.abort();
        this._request = undefined;
        delete this._request;
      }
    }
  };
  
  // Remap some of the CloudMine API query parameters.
  var valid_params = {
    limit: 'limit',
    skip: 'skip',
    snippet: 'f', // Run code snippet on the data
    params: 'params', // Only applies to code snippets, parameters for the code snippet (JSON).
    dontwait: 'async', // Only applies to code snippets, don't wait for results.
    resultsonly: 'result_only', // Only applies to code snippets, only show results from code snippet.
    count: 'count'
  };

  // Default jQuery ajax configuration.
  var defaultConfig = {
    async: true,
    later: false,
    contentType: 'application/json',
    processData: false,
    dataType: 'text',
    processResponse: APICall.textResponse,
    crossDomain: true,
    cache: false
  };

  // Map HTTP codes that could come from CloudMine
  var httpcode = {
    200: 'ok',
    201: 'created',
    400: 'badrequest',
    401: 'unauthorized',
    404: 'notfound',
    409: 'conflict',
    500: 'servererror'
  };

  // Scope external dependencies, if necessary.
  var esc = this.encodeURIComponent || escape;
  var FileReader = this.FileReader;
  var BlobBuilder = this.BlobBuilder || this.WebKitBlobBuilder || this.MozBlobBuilder || this.MSBlobBuilder;
  var ArrayBuffer = this.ArrayBuffer;
  var CanvasRenderingContext2D = this.CanvasRenderingContext2D;
  var CanvasImageData = this.CanvasImageData;
  var ArrayBufferView = this.ArrayBufferView;
  var File = this.File;
  var swfupload = this.swfupload;

  // Utility functions.
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

  function opts(scope, options) {
    return merge({}, scope.options, options);
  }

  function server_params(options, map) {
    var key, value;
    if (map == null) {
      map = {};
    }
    for (key in valid_params) {
      value = valid_params[key];
      if (options[key] != null) {
        map[value] = options[key];
      }
    }
    return map;
  }

  // Callbacks stored as: [originalCallback, context, wrappedCallback]
  function removeCallbacks(src, callback, context) {
    return filter(src, function(event) {
      return (!callback || event[0] == callback) && (!context || context == event[1]);
    });
  }

  function slice(array, x, y) {
    return Array.prototype.slice.call(array, x, y);
  }

  function each(item, callback, context) {
    context = context || this
    if (isArray(item)) {
      if (item.forEach) item.forEach(callback, context);
      else {
        for (var i = 0; i < item.length; ++i) {
          var obj = item[i];
          if (obj != null) callback.call(context, obj, k, context);
        }
      }
    } else if (isObject(item)) {
      for (var k in item) {
        var obj = item[k];
        if (obj != null) callback.call(context, obj, k, context);
      }
    }
  }

  function filter(item, callback, context) {
    var out = null;
    context = context || this;
    if (isArray(item)) {
      if (item.filter) {
        out = item.filter(callback, context);
      } else {
        out = [];
        each(item, function(value, key, collection) {
          if (callback.apply(this, arguments)) out.push(value);
        });
      }
    } else {
      out = {};
      each(item, function(value, key, collection) {
        if (callback.apply(this, arguments)) out[key] = value;
      });
    }
    return out;
  }

  function isObject(item) {
    return item && typeof item === "object"
  }

  function isString(item) {
    return item && typeof item === "string"
  }

  function isArray(item) {
    return isObject(item) && item.length != null
  }

  function isFunction(item) {
    return typeof item === 'function';
  }
  
  function isEmptyObject(item) {
    if (item) {
      for (var k in item) {
        if (item.hasOwnProperty(k)) return false;
      }
    }
    return true;
  }

  function stringify(map, sep, eol, ignore) {
    var out = [];
    sep = sep || '=';
    var escape = ignore ? function(s) { return s; } : esc;
    for (var k in map) {
      if (map[k] != null && !isFunction(map[k])){
        out.push(escape(k) + sep + escape(map[k]));
      }
    }
    return out.join(eol || '&');
  }

  function merge(obj/*, in...*/) {
    for (var i = 1; i < arguments.length; ++i) {
      each(arguments[i], function(value, key, collection) {
        if (value != null) obj[key] = value; 
      });
    }
    return obj;
  }

  // Export CloudMine objects.
  var http, https, ajax, url, apiroot = "https://api.cloudmine.me";
  if (!this.window) {
    ajax = function(url, config) { return new NodeAJAX(url, config); };
    url = require('url');
    http = require('http');
    https = require('https');
    module.exports = WebService;
  } else {
    window.cloudmine = window.cloudmine || {};
    window.cloudmine.WebService = WebService;
    if (window.cloudmine.API) apiroot = window.cloudmine.API;
    if (($ = this.jQuery || this.Zepto) != null) ajax = $.ajax;
    else throw "Missing jQuery-compatible ajax implementation";
  }

  // Base64 Library from http://www.webtoolkit.info
  var base64 = {_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(a){var b="";var c,d,e,f,g,h,i;var j=0;a=base64._utf8_encode(a);while(j<a.length){c=a.charCodeAt(j++);d=a.charCodeAt(j++);e=a.charCodeAt(j++);f=c>>2;g=(c&3)<<4|d>>4;h=(d&15)<<2|e>>6;i=e&63;if(isNaN(d)){h=i=64}else if(isNaN(e)){i=64}b=b+this._keyStr.charAt(f)+this._keyStr.charAt(g)+this._keyStr.charAt(h)+this._keyStr.charAt(i)}return b},decode:function(a){var b="";var c,d,e;var f,g,h,i;var j=0;a=a.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(j<a.length){f=this._keyStr.indexOf(a.charAt(j++));g=this._keyStr.indexOf(a.charAt(j++));h=this._keyStr.indexOf(a.charAt(j++));i=this._keyStr.indexOf(a.charAt(j++));c=f<<2|g>>4;d=(g&15)<<4|h>>2;e=(h&3)<<6|i;b=b+String.fromCharCode(c);if(h!=64){b=b+String.fromCharCode(d)}if(i!=64){b=b+String.fromCharCode(e)}}b=base64._utf8_decode(b);return b},_utf8_encode:function(a){a=a.replace(/\r\n/g,"\n");var b="";for(var c=0;c<a.length;c++){var d=a.charCodeAt(c);if(d<128){b+=String.fromCharCode(d)}else if(d>127&&d<2048){b+=String.fromCharCode(d>>6|192);b+=String.fromCharCode(d&63|128)}else{b+=String.fromCharCode(d>>12|224);b+=String.fromCharCode(d>>6&63|128);b+=String.fromCharCode(d&63|128)}}return b},_utf8_decode:function(a){var b="";var c=0;var d=c1=c2=0;while(c<a.length){d=a.charCodeAt(c);if(d<128){b+=String.fromCharCode(d);c++}else if(d>191&&d<224){c2=a.charCodeAt(c+1);b+=String.fromCharCode((d&31)<<6|c2&63);c+=2}else{c2=a.charCodeAt(c+1);c3=a.charCodeAt(c+2);b+=String.fromCharCode((d&15)<<12|(c2&63)<<6|c3&63);c+=3}}return b}};

})();

