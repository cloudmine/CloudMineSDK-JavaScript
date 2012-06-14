/* CloudMine JavaScript Library v0.9 cloudmine.me | cloudmine.me/license */ 
(function() {
  /**
   * Construct a new WebService instance
   *
   * <p>Each method on the WebService instance will return an APICall object which may be used to
   * access the results of the method called. You can chain multiple events together with the
   * returned object (an APICall instance).
   *
   * <p>All events are at least guaranteed to have the callback signature: function(data, apicall).
   * supported events:
   * <p>   200, 201, 400, 401, 404, 409, ok, created, badrequest, unauthorized, notfound, conflict,
   *    success, error, complete, meta, result, abort
   * <p>Event order: success callbacks, meta callbacks, result callbacks, error callbacks, complete
   * callbacks 
   *
   * <p>Example:
   * <pre class='code'>
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
   * </pre>
   * <p>Refer to APICall's documentation for further information on events.
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
   * @name WebService
   * @constructor
   */
  function WebService(options) {
    this.options = opts(this, options);
  }

  /** @namespace WebService.prototype */
  WebService.prototype = {
    /**
     * Get data from CloudMine.
     * Results may be affected by defaults and/or by the options parameter.
     * @param {string|string[]|null} keys If set, return the specified keys, otherwise return all keys. 
     * @param {object} options Override defaults set on WebService. See WebService constructor for parameters.
     * @return {APICall} An APICall instance for the web service request used to attach events.
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
     * @param {object} data An object hash where the top level properties are the keys.
     * @param {object} options Override defaults set on WebService. See WebService constructor for parameters.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     *
     * @function
     * @name update
     * @memberOf WebService.prototype
     */
    /**
     * Create new data, and merge existing data.
     * The data must be convertable to JSON.
     * Results may be affected by defaults and/or by the options parameter.
     * @param {string|null} key The key to affect. If given null, a random key will be assigned.
     * @param {string|number|object} value The value of the object
     * @param {object} options Override defaults set on WebService. See WebService constructor for parameters.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     *
     * @function
     * @name update^2
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
     * @param {object} data An object hash where the top level properties are the keys.
     * @param {object} options Override defaults set on WebService. See WebService constructor for parameters.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     *
     * @function
     * @name set
     * @memberOf WebService.prototype
     */
    /**
     * Create or overwrite existing objects in CloudMine with the given key or keys.
     * The data must be convertable to JSON.
     * Results may be affected by defaults and/or by the options parameter.
     * @param {string|null} key The key to affect. If given null, a random key will be assigned.
     * @param {string|number|object} The object to store. 
     * @return {APICall} An APICall instance for the web service request used to attach events.
     *
     * @function
     * @name set^2
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
     * @return {APICall} An APICall instance for the web service request used to attach events.
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
     * @return {APICall} An APICall instance for the web service request used to attach events.
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
     * @return {APICall} An APICall instance for the web service request used to attach events.
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
     * @param {string} key The binary file's object key.
     * @param {file|string} file FileAPI: A HTML5 FileAPI File object, Node.js: The filename to upload.
     * @param {object} options Override defaults set on WebService. See WebService constructor for parameters.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     */
    upload: function(key, file, options) {
      options = opts(this, options);
      if (!options.filename) options.filename = key;
      if (!key) key = uuid();

      // Warning: may not necessarily use ajax to perform upload.
      var apicall = new APICall({
        action: 'binary/' + key,
        type: 'post',
        later: true,
        encoding: 'binary',
        options: options,
        appid: options.appid,
        apikey: options.apikey,
        processResponse: APICall.basicResponse
      });

      function upload(data, type) {
        if (!options.contentType) options.contentType = type || defaultType;
        APICall.binaryUpload(apicall, data, options.filename, options.contentType).done();
      }
      
      if (isString(file) || (Buffer && file instanceof Buffer)) {
        // Upload by filename

        if (ajax == NodeAJAX) {
          if (isString(file)) file = require('fs').readFileSync(file);
          upload(file);
        }
        else NotSupported();
      } else if (file.toDataURL) {
        // Canvas will have a toDataURL function.
        upload(file, 'image/png');
      } else if (CanvasRenderingContext2D && file instanceof CanvasRenderingContext2D) {
        upload(file.canvas, 'image/png');
      } else if (isBinary(file)) {
        // Binary files are base64 encoded from a buffer.
        var reader = new FileReader();
        
        /** @private */
        reader.onabort = function() {
          apicall.setData("FileReader aborted").abort();
        }

        /** @private */
        reader.onerror = function(e) {
          apicall.setData(e.target.error).abort();
        }

        /** @private */
        reader.onload = function(e) {
          upload(e.target.result);
        }

        // Don't need to transform Files to Blobs.
        if (File && file instanceof File) {
          if (!options.contentType && file.type != "") options.contentType = file.type;
        } else {
          file = getBlob(file, options.contentType || defaultType);
        }
        
        reader.readAsDataURL(file);
      } else NotSupported();

      return apicall;
    },

    /**
     * Download a file stored in CloudMine.
     * @param {string} key The binary file's object key.
     * @param {object} options Override defaults set on WebService. See WebService constructor for parameters.
     * @config {string} [filename] If present, the file will be downloaded directly to the computer with the
     *                             filename given. This does not validate the filename given!
     * @config {string} [mode] If buffer, automatically move returning data to either an ArrayBuffer or Buffer
     *                         if supported. Otherwise the result will be a standard string.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     */
    download: function(key, options) {
      options = opts(this, options);
      var response = {success: {}}, query;

      if (options.filename) {
        query = {
          force_download: true,
          apikey: options.apikey,
          session_token: options.session_token,
          filename: options.filename
        }
      }

      var apicall = new APICall({
        action: 'binary/' + key,
        type: 'GET',
        later: true,
        encoding: 'binary',
        options: options,
        query: query,
        appid: options.appid,
        apikey: options.apikey
      });

      // Download file directly to computer if given a filename.
      if (options.filename) {
        if (ajax == NodeAJAX) {
          apicall.setProcessor(function(data) {
            response.success[key] = require('fs').writeFileSync(options.filename, data, 'binary');
            return response;
          }).done();
        } else {
          function detach() {
            if (iframe.parentNode) document.body.removeChild(iframe);
          }
          var iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.src = apicall.url;
          iframe.onload = detach;
          detach.timer = setTimeout(detach, 60000);
          document.body.appendChild(iframe);
          response.success[key] = iframe;
        }

        apicall.done(response);
      } else if (options.mode === 'buffer' && (ArrayBuffer || Buffer)) {
        apicall.setProcessor(function(data) {
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

          response.success[key] = buffer;
          return response;
        }).done();
      } else {
        // Raw data return. Do not attempt to process the result.
        apicall.setProcessor(function(data) {
          response.success[key] = data;
          return response;
        }).done();
      }

      return apicall;
    },


    /**
     * Create a new user.
     * @param {object} data An object with a userid and password field.
     * @param {object} options Override defaults set on WebService. See WebService constructor for parameters.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     *
     * @param {object} options Override defaults set on WebService. See WebService constructor for parameters.
     * @function
     * @name createUser
     * @memberOf WebService.prototype
     */
     /**
     * Create a new user.
     * @param {string} user The userid to login as.
     * @param {string} password The password to login as.
     * @param {object} options Override defaults set on WebService. See WebService constructor for parameters.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     *
     * @param {object} options Override defaults set on WebService. See WebService constructor for parameters.
     * @function
     * @name createUser^2
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
     * @param {object} data An object with userid, password, and oldpassword fields.
     * @param {object} options Override defaults set on WebService. See WebService constructor for parameters.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     *
     * @function
     * @name changePassword
     * @memberOf WebService.prototype
     */
    /**
     * Change a user's password
     * @param {string} user The userid to change the password.
     * @param {string} oldpassword The existing password for the user.
     * @param {string} password The new password for the user.
     * @param {object} options Override defaults set on WebService. See WebService constructor for parameters.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     *
     * @function
     * @name changePassword^2
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
          Authorization: "Basic " + (Base64.encode(user.userid + ":" + user.oldpassword))
        }
      });
    },

    /**
     * Initiate a password reset request.
     * @param {string} userid The userid to send a reset password email to.
     * @param {object} options Override defaults set on WebService. See WebService constructor for parameters.
     * @return {APICall} An APICall instance for the web service request used to attach events.
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
     * @return {APICall} An APICall instance for the web service request used to attach events.
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
     * @param {object} data An object hash with userid and password fields.
     * @param {object} options Override defaults set on WebService. See WebService constructor for parameters.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     *
     * @function
     * @name login
     * @memberOf WebService.prototype
     */
    /**
     * Login as a user to access user-level data.
     * @param {string} user The user to login as
     * @param {string} password The password for the user
     * @param {object} options Override defaults set on WebService. See WebService constructor for parameters.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     *
     * @function
     * @name login^2
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
          Authorization: "Basic " + (Base64.encode("" + user.userid + ":" + user.password))
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
     * @return {APICall} An APICall instance for the web service request used to attach events.
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
     * @param {object} data An object with userid and password fields.
     * @param {object} options Override defaults set on WebService. See WebService constructor for parameters.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     *
     * @function
     * @name verify
     * @memberOf WebService.prototype
     */
    /**
     * Verify if the given userid and password is valid.
     * @param {string} user The userid to login
     * @param {string} password The password of the user to login
     * @param {object} options Override defaults set on WebService. See WebService constructor for parameters.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     *
     * @function
     * @name verify^2
     * @memberOf WebService.prototype
     */
    verify: function(user, password, options) {
      if (isObject(user)) opts = password;
      else user = {userid: user, password: password};
      options = opts(this, options);
      options.applevel = true;
      
      return new APICall({
        action: 'account/login',
        type: 'POST',
        appid: this.options.appid,
        apikey: this.options.apikey,
        processResponse: APICall.basicResponse,
        headers: {
          Authorization: "Basic " + (Base64.encode(user.userid + ":" + user.password))
        },
        options: options
      });
    },

    /**
     * Check if the store has a logged in user.
     * @return {boolean} True if the user is logged in, false otherwise.
     */
    isLoggedIn: function() {
      return !!this.options.session_token;
    },

    /**
     * Get the current userid
     * @return {string} The logged in userid, if applicable.
     */
    getUserID: function() {
      return this.options.userid;
    },

    /**
     * Get the current session token.
     * @return {string} The current session token, if logged in.
     */
    getSessionToken: function() {
      return this.options.session_token;
    },

    /**
     * Get a default option that is sent to the server.
     * @param {string} option A default parameter to send to the server.
     * @return {*} The value of the default parameter.
     */
    getOption: function(option) {
      return (valid_params[option] ? this.options[option] : null);
    },
    
    /**
     * Set a default option that is sent to the server
     * @param {string} option A default parameter to send to the server.
     * @param {string} value The value of the option to set.
     * @return {boolean} true if the option was set, false for invalid options.
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
     * @return {boolean} true if this store is using application data, false if is using user-level data.
     */
    isApplicationData: function() {
      if (this.options.applevel === true || this.options.applevel === false) return this.options.applevel;
      return this.options.session_token == null;
    }
  };
  
  /**
   * <p>WebService will return an instance of this class that should be used to interact with
   * the API. Upon completion of the AJAX call, this object will fire the event handlers based on
   * what were attached.
   *
   * <p>You may chain event creation.
   *
   * <p><b>Note:</b> It is recommended to avoid referring directly to the ajax implementation used by this
   *       function. Depending on environment, features on it may vary since this library only
   *       requires a small subset of jQuery-like AJAX functionality.
   *
   * <p>Event firing order:
   *    <div>Successes: HTTP Code String, HTTP Code Number, 'success'</div>
   *    <div>Meta: 'meta' - This is for operations that can write meta data.</div>
   *    <div>Result: 'result' - This is results from code snippets if used.</div>
   *    <div>Errors: HTTP Code String, HTTP Code Number, 'error'</div>
   *
   * <p>Event callback signatures:
   *    <div>HTTP Codes: function(keys, responseObject, statusCode)</div>
   *    <div>'error': function(keys, responesObject)</div>
   *    <div>'success': function(keys, responseObject)</div>
   *    <div>'meta': function(keys, responseObject)</div>
   *    <div>'result: function(keys, responseObject)</div>
   *    <div>'abort': function(keys, responseObject)</div>
   * @class
   * @name APICall
   */
  function APICall(config) {
    this.config = merge({}, defaultConfig, config);
    this._events = {};

    // Fields that are available at the completion of the api call.
    this.additionalData = this.config.callbackData;
    this.data = null;
    this.hasErrors = false;
    this.requestData = this.config.data;
    this.requestHeaders = {
      'X-CloudMine-ApiKey': this.config.apikey,
      'X-CloudMine-Agent': 'JS/0.9',
    };
    this.responseHeaders = {};
    this.responseText = null;
    this.status = null;
    this.type = this.config.type || 'GET';
    
    // Build the URL and headers

    var query = stringify(server_params(this.config.options, this.config.query));
    var root = '/', session = this.config.options.session_token, applevel = this.config.options.applevel;
    if (applevel === false || (applevel !== true && session != null)) {
      root = '/user/';
      if (session != null) this.requestHeaders['X-CloudMine-SessionToken'] = session;
    }
    this.config.headers = merge(this.requestHeaders, this.config.headers);
    this.setContentType(config.contentType || 'application/json');
    this.url = [apiroot, "/v1/app/", this.config.appid, root, this.config.action, (query ? "?" + query : "")].join("");
    
    var self = this, sConfig = this.config;
    
    /** @private */
    this.config.complete = function(xhr, status) {
      var data;
      if (xhr) {
        data = xhr.responseText
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
      } else {
        self.status = 'abort';
        self.data = [ sConfig.data ];
      }

      // Parse the response only if a safe status
      if (status == 'success' && self.status >= 200 && self.status < 300) {
        // Preprocess data coming in to hash-hash: [success/errors].[httpcode]
        data = sConfig.processResponse.call(self, self.data, xhr, self);
      } else {
        data = {errors: {}};
        if (isString(self.data)) {
          self.data = { errors: [ self.data ] } // This way, we can rely on this structure data[statuscode].errors to always be an Array of one or more errors
        }
        data.errors[self.status] = self.data;
      }

      setTimeout(function() {
        APICall.complete(self, data);
      }, 1);
    }

    // Let script continue before triggering ajax call
    if (!this.config.later && this.config.async) {
      setTimeout(function() {
        self.xhr = ajax(self.url, sConfig);
      }, 1);
    }
  }

  /** @namespace APICall.prototype */
  APICall.prototype = {
    /**
     * Attach an event listener to this APICall object.
     * @param {string|number} eventType The event to listen to. Can be an http code as number or string,
     *                                  success, meta, result, error.
     * @param {function} callback Callback to call upon event trigger.
     * @param {object} context Context to call the callback in.
     * @return {APICall} The current APICall object
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
     * All parameters following event will be sent to the event handlers.
     * @param {string|number} event The event to trigger.
     * @return {APICall} The current APICall object
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
     * @param {string|number} eventType The event type which can be an http code as number or string,
     *                                  or can be success, error, meta, result, abort.
     * @param {function} callback The function that was used to create the callback.
     * @param {object} context The context to call the callback in.
     * @return {APICall} The current APICall object
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
     * Set the content-type for a waiting APICall.
     * Note: this has no effect if the APICall has completed.
     * @param {string} type The content-type to set. If not specified, this will use 'application/octet-stream'.
     * @return {APICall} The current APICall object
     */
    setContentType: function(type) {
      type = type || defaultType;
      if (this.config) {
        this.config.contentType = type;
        this.requestHeaders['content-type'] = type;
        this.config.headers['content-type'] = type;
      }
      return this;
    },

    /**
     * Aborts the current connection. This is ineffective for running synchronous calls or completed
     * calls. Synchronous calls can be achieved by setting async to false in WebService.
     * @return {APICall} The current APICall object
     */
    abort: function() {
      if (this.xhr) {
        this.xhr.abort();
        this.xhr = undefined;
        delete this.xhr;
      } else if (this.config) {
        this.config.complete.call(this, this.xhr, 'abort');
        this.config = undefined;
        delete this.config;
      }
      return this;
    },

    /**
     * Set data to send to the server. This is ineffective for running ajax calls.
     * @return {APICall} The current APICall object
     */
    setData: function(data) {
      if (!this.xhr && this.config) {
        this.config.data = data;
      }
      return this;
    },

    /**
     * Set the data processor for the APICall. This is ineffective for running ajax calls.
     * @return {APICall} The current APICall object
     */
    setProcessor: function(func) {
      if (!this.xhr && this.config) {
        this.config.processResponse = func;
      }
      return this;
    },
    
    /**
     * If a synchronous ajax call is done (via setting: options.async = false), you must call this function
     * after you have attached all your event handlers. You should not attach event handlers after this
     * is called.
     */
    done: function(response) {
      if (!this.xhr && this.config) {
        if (response) {
          this.xhr = true;
          var self = this;
          setTimeout(function() {
            APICall.complete(self, response);
            self.config = undefined;
            delete self.config;
          }, 1);
        } else {
          this.xhr = ajax(this.url, this.config);
          this.config = undefined;
          delete this.config;
        }
      }
      return this;
    }
  };

  /**
   * Complete the given API Call, usually called after completed processing of data, though can be
   * used to circumvent the standard AJAX call functionality for calls that are not currently running.
   * @param {APICall} apicall The api call to affect. Can be either a completed request or a deferred request.
   * @param {object} data Processed data where the top level keys are: success, errors, meta, result.
   * 
   * @private
   * @function
   * @memberOf APICall
  */
  APICall.complete = function(apicall, data) {
    // Success results may have errors for certain keys
    if (data.errors) apicall.hasErrors = true;

    // Clean up temporary state.
    if (apicall.config) {
      apicall.config = undefined;
      delete apicall.config;
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


  /**
   * Standard CloudMine response for the 200-299 range responses.
   * This will transform the response so that APICall.complete will trigger the appropriate handlers.
   * 
   * @private
   * @function
   * @memberOf APICall
  */
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

      // At least guarantee a success callback.
      if (isEmptyObject(out)) {
        if (this.config.options && this.config.options.snippet) out.result = {};
        else out.success = {};
      }
    } else {
      // Non-standard response. Just pass back the data we were given.
      out = {success: data};
    }

    return out;
  }

  /**
   * Minimal processing of data so that the success handler is called upon completion.
   * This assumes any response in the 200-299 range is a success.
   * 
   * @private
   * @function
   * @memberOf APICall
  */
  APICall.basicResponse = function(data, xhr, response) {
    var out = {success: {}};
    out.success = data;
    return out;
  }

  /**
   * Convert binary data in browsers to a transmitable version and assign it to the given
   * api call.
   * @param {APICall} apicall The APICall to affect, it should have later: true.
   * @param {object|string} data The data to send to the server. Strings are expected to be base64 encoded.
   * @param {string} filename The filename to upload as.
   * @param {string} contentType The content-type of the file. If not specified, it will guess if possible,
   *                             otherwise assume application/octet-stream.
   * @return {APICall} The apicall object that was given.
   *               
   * @private
   * @function
   * @memberOf APICall
  */
  APICall.binaryUpload = function(apicall, data, filename, contentType) {
    var boundary = uuid();
    if (Buffer && data instanceof Buffer) {
      data = data.toString('base64');
      if (!contentType) contentType = defaultType;
    } else {
      if (data.toDataURL) data = data.toDataURL(contentType);
      data = data.replace(/^data:(.*?);?base64,/, '');
      if (!contentType) contentType = RegExp.$1 || defaultType;
    }

    apicall.setContentType('multipart/form-data; boundary=' + boundary);
    return apicall.setData([
      '--' + boundary,
      'Content-Disposition: form-data; name="file"; filename="' + filename + '"',
      'Content-Type: ' + contentType,
      'Content-Transfer-Encoding: base64',
      '',
      data,
      '--' + boundary + '--'
    ].join('\r\n'));
  }

  /**
   * Node.JS jQuery-like ajax adapter.
   * This is an internal class that is not exposed.
   *
   * @param {string} uri The complete url to hit.
   * @param {object} config Parameters for the ajax request.
   * @config {string} [contentType] The Content Type of the request.
   * @config {string} [type] The type of request, e.g. 'get', 'post'
   * @config {object} [headers] Request headers to send to the client.
   * @config {boolean} [processData] If true, process the data given.
   * @config {string|Array|Object} [data] Data to send to the server.
   * @name HttpRequest
   * @constructor
   */
  function HttpRequest(uri, config) {
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
    this._textStatus = 'success';
    this._request = (opts.protocol === "http:" ? http : https).request(opts, function(response) {
      response.setEncoding(config.encoding || 'utf8');

      response.on('data', function(chunk) {
        self.responseText.push(chunk);
      });

      response.on('close', function() {
        response.emit('end');
      });

      response.on('end', function() {
        self._headers = stringify(response.headers);
        self.status = response.statusCode;

        // Process data if necessary.
        var data = self.responseText = self.responseText.join('');
        if (config.dataType == 'json' || (config.dataType != 'text' && response.headers['content-type'].match(/\bapplication\/json\b/i))) {
          try {
            data = JSON.parse(data);
          } catch (e) {
            self._textStatus = 'parsererror';
          }
        }

        
        if (self._textStatus == 'success' && self.status >= 200 && self.status < 300) {
          if (config.success) config.success.call(cbContext, data, 'success', self);
        } else if (config.error) {
          config.error.call(cbContext, self, 'error', self.responseText);
        }
        if (config.complete) config.complete.call(cbContext, self, self._textStatus);
      });
    });

    // Handle request errors.
    this._request.on('error', function(e) {
      self.status = e.status;
      self.responseText = e.message;
      self._textStatus = 'error';
      if (config.error) config.error.call(cbContext, self, 'error', e.message);
      if (config.complete) config.complete.call(cbContext, self, 'error');
    });

    // Send data (if present) and fire the request.
    this._request.end(config.data);
  }

  /** @namespace HttpRequest.prototype */
  HttpRequest.prototype = {
    /**
     * Return a given response header
     * @param {string} The header field to retreive.
     * @return {string|null} The value of that header, if it exists.
     */
    getResponseHeader: function(header) {
      return this._headers[header];
    },
    
    /**
     * Get all the response headers.
     * @return {object} An object representing all the response headers.
     */
    getAllResponseHeaders: function() {
      return stringify(this._headers, ': ', '\n');
    },

    /**
     * Abort the current connection. This has no effect if the request is already completed.
     * This will trigger an abort error event.
     */
    abort: function() {
      if (this._request) {
        this._textStatus = 'abort';
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
  var base = this.window ? window : root;
  var defaultType = 'application/octet-stream';
  var esc = base.encodeURIComponent || escape;
  var File = base.File;
  var FileReader = base.FileReader;
  var BlobBuilder = base.BlobBuilder || base.WebKitBlobBuilder || base.MozBlobBuilder || base.MSBlobBuilder;
  var ArrayBuffer = base.ArrayBuffer;
  var Buffer = base.Buffer;
  var CanvasRenderingContext2D = base.CanvasRenderingContext2D;
  var BinaryClasses = [ File, Buffer, CanvasRenderingContext2D, ArrayBuffer, base.Uint8Array, base.Uint8ClampedArray, base.Uint16Array, base.Uint32Array, base.Int8Array, base.Int16Array, base.Int32Array, base.Float32Array, base.Float64Array ];

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

  function isBinary(item) {
    return isObject(item) && BinaryClasses.indexOf(item.constructor) > -1
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

  function getBlob(data, contentType) {
    var blob;
    if (!contentType) contentType = defaultType;
    data = new Uint8Array(data);
    try {
      // Binary in javascript is such a nightmare.
      blob = new Blob(data, {type: contentType});
    } catch (e) {
      var builder = new BlobBuilder();
      builder.append(data);
      blob = builder.getBlob(contentType);
    }
    return blob;
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
  
  function NotSupported() {
    throw new Error("Unsupported operation", "cloudmine.js");
  }

  function NodeAJAX(url, config) {
    return new HttpRequest(url, config);
  }

  // Export CloudMine objects.
  var http, https, ajax, url, apiroot = "https://api.cloudmine.me";
  if (!this.window) {
    ajax = NodeAJAX;
    url = require('url');
    http = require('http');
    https = require('https');
    module.exports = WebService;
  } else {
    window.cloudmine = window.cloudmine || {};
    window.cloudmine.WebService = WebService;
    if (window.cloudmine.API) apiroot = window.cloudmine.API;
    if (($ = this.jQuery || this.Zepto) != null) ajax = $.ajax;
    else throw new Error("Missing jQuery-compatible ajax implementation", "cloudmine.js");
  }

  // Base64 Library from http://www.webtoolkit.info
  var Base64 = {
	  // private property
	  _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    
	  // public method for encoding
	  encode : function (input) {
		  var output = "", chr1, chr2, chr3, enc1, enc2, enc3, enc4, i = 0;      
		  input = Base64._utf8_encode(input);

		  while (i < input.length) {
			  chr1 = input.charCodeAt(i++);
			  chr2 = input.charCodeAt(i++);
			  chr3 = input.charCodeAt(i++);

			  enc1 = chr1 >> 2;
			  enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			  enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			  enc4 = chr3 & 63;
        
			  if (isNaN(chr2)) enc3 = enc4 = 64;
			  else if (isNaN(chr3)) enc4 = 64;
        
			  output += this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
			            this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
		  }
      
		  return output;
	  },
    
	  // public method for decoding
	  decode : function (input) {
		  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		  var output = "", chr1, chr2, chr3;
		  var enc1, enc2, enc3, enc4, i = 0;
      
		  while (i < input.length) {
			  enc1 = this._keyStr.indexOf(input.charAt(i++));
			  enc2 = this._keyStr.indexOf(input.charAt(i++));
			  enc3 = this._keyStr.indexOf(input.charAt(i++));
			  enc4 = this._keyStr.indexOf(input.charAt(i++));
        
			  chr1 = (enc1 << 2) | (enc2 >> 4);
			  chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			  chr3 = ((enc3 & 3) << 6) | enc4;
        
			  output += String.fromCharCode(chr1);
			  if (enc3 != 64) output += String.fromCharCode(chr2);
			  if (enc4 != 64) output += String.fromCharCode(chr3);
		  }
      
		  return Base64._utf8_decode(output);
	  },
    
	  // private method for UTF-8 encoding
	  _utf8_encode : function (string) {
		  string = string.replace(/\r\n/g,"\n");
		  var utftext = "";
      
		  for (var n = 0; n < string.length; n++) {
			  var c = string.charCodeAt(n);
        
			  if (c < 128) utftext += String.fromCharCode(c);
			  else if((c > 127) && (c < 2048)) {
				  utftext += String.fromCharCode((c >> 6) | 192);
				  utftext += String.fromCharCode((c & 63) | 128);
			  } else {
				  utftext += String.fromCharCode((c >> 12) | 224);
				  utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				  utftext += String.fromCharCode((c & 63) | 128);
			  }
		  }
      
		  return utftext;
	  },
    
	  // private method for UTF-8 decoding
	  _utf8_decode : function (utftext) {
		  var string = "", i = 0, c = c1 = c2 = 0;
		  while (i < utftext.length) {
			  c = utftext.charCodeAt(i);
        
			  if (c < 128) {
				  string += String.fromCharCode(c);
				  i++;
			  } else if((c > 191) && (c < 224)) {
				  c2 = utftext.charCodeAt(i+1);
				  string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				  i += 2;
			  } else {
				  c2 = utftext.charCodeAt(i+1);
				  c3 = utftext.charCodeAt(i+2);
				  string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				  i += 3;
			  }
		  }
      
		  return string;
	  }
  }
})();
