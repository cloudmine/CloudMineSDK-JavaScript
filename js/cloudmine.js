/* CloudMine JavaScript Library v0.10.x cloudmineinc.com | https://github.com/cloudmine/cloudmine-js/blob/master/LICENSE */
(function() {
  var version = '0.9.21';

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
   * var ws = new cloudmine.WebService({appid: "abc", apikey: "abc", appname: 'SampleApp', appversion: '1.0'});
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
   * @config {string} [appname] An alphanumeric identifier for your app, used for stats purposes
   * @config {string} [appversion] A version identifier for you app, used for stats purposes
   * @config {boolean} [applevel] If true, always send requests to application.
   *                              If false, always send requests to user-level, trigger error if not logged in.
   *                              Otherwise, send requests to user-level if logged in.
   * @config {boolean} [savelogin] If true, session token and email / username will be persisted between logins.
   * @config {integer} [limit] Set the default result limit for requests
   * @config {string} [sort] Set the field on which to sort results
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
    if(!this.options.apiroot) this.options.apiroot = "https://api.cloudmine.io";

    var src = this.options.appid;
    if (options.savelogin) {
      if (!this.options.email) this.options.email = retrieve('email', src);
      if (!this.options.username) this.options.username = retrieve('username', src);
      if (!this.options.session_token) this.options.session_token = retrieve('session_token', src);
    }

    this.options.user_token = retrieve('ut', src) || store('ut', this.keygen(), src);
  }

  /** @namespace WebService.prototype */
  WebService.prototype = {
    /**
     * generic function for calling the api with a minimal set of logic and optons
     * @param {string} action Action endpoint - 'text', 'data',  etc
     * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters.
     * @param {object} [data] Request body (optional).  If present, will be automatically stringified.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     *
     * @function
     * @name api
     * @memberOf WebService.prototype
     */
    api: function(action, options, data) {
      options = opts(this, options);

      var method = options.method || 'GET';

      var args = {
        action: action,
        type: method,
        options: options
      };

      if (options.query) {
        args.query = options.query;
        delete args.options.query;
      }

      if (data !== undefined) {
        args.data = JSON.stringify(data);
      }

      return new APICall(args);
    },

    /**
     * Get data from CloudMine.
     * Results may be affected by defaults and/or by the options parameter.
     * @param {string|string[]|null} [keys] If set, return the specified keys, otherwise return all keys.
     * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     */
    get: function(keys, options) {
      if (isArray(keys)) keys = keys.join(',');
      else if (isObject(keys)) {
        options = keys;
        keys = null;
      }

      options = opts(this, options);
      var query = keys ? server_params(options, {keys: keys}) : null;
      return new APICall({
        action: 'text',
        type: 'GET',
        options: options,
        query: query
      });
    },

    /**
     * Create new data, and merge existing data.
     * The data must be convertable to JSON.
     * Results may be affected by defaults and/or by the options parameter.
     * @param {object} data An object hash where the top level properties are the keys.
     * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters.
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
     * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     *
     * @function
     * @name update^2
     * @memberOf WebService.prototype
     */
    update: function(key, value, options) {
      if (isObject(key)) options = value;
      else {
        if (!key) key = this.keygen();
        var out = {};
        out[key] = value;
        key = out;
      }
      options = opts(this, options);

      return new APICall({
        action: 'text',
        type: 'POST',
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
     * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters.
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
     * @param {string|number|object} value The object to store.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     *
     * @function
     * @name set^2
     * @memberOf WebService.prototype
     */
    set: function(key, value, options) {
      if (isObject(key)) options = value;
      else {
        if (!key) key = this.keygen();
        var out = {};
        out[key] = value;
        key = out;
      }
      options = opts(this, options);

      return new APICall({
        action: 'text',
        type: 'PUT',
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
     * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters. Pass all:true with null keys to really delete all values, or query with a query object or string to delete objects matching query. WARNING: using the query is DANGEROUS. Triple check your query!
     * @return {APICall} An APICall instance for the web service request used to attach events.
     */
    destroy: function(keys, options) {
      options = opts(this, options);
      var params = {};
      if (keys == null && options.all === true) params = {all: true};
      else if (options.query){
        params = {q: convertQueryInput(options.query)};
        delete options.query;
      } else {
        params = {keys: (isArray(keys) ? keys.join(',') : keys)};
      }

      return new APICall({
        action: 'data',
        type: 'DELETE',
        options: options,
        query: server_params(options, params)
      });
    },


    /**
     * Run a code snippet directly.
     * Default http method is 'GET', to change the method set the method option for options.
     * @param {string} snippet The name of the code snippet to run.
     * @param {object} params Data to send to the code snippet (optional).
     * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     */
    run: function(snippet, parameters, options) {
      options = opts(this, options);
      parameters = merge({}, options.params, parameters);
      options.params = null;
      options.snippet = null;

      var call_opts = {
        action: 'run/' + snippet,
        type: options.method || 'GET',
        options: options
      };

      if(call_opts.type === 'GET')
        call_opts.query = parameters;
      else {
        call_opts.data = JSON.stringify(parameters);
      }

      return new APICall(call_opts);
    },

    /**
     * Search CloudMine for text objects.
     * Results may be affected by defaults and/or by the options parameter.
     * @param {string} query Query parameters to search for.
     * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     */
    search: function(query, options) {
      options = opts(this, options);
      query = {q: query != null ? convertQueryInput(query) : ''}

      var data = undefined;
      if(options.method === "POST"){
        data = JSON.stringify(query);
        query = {}; // don't send q in URL
      }

      return new APICall({
        action: 'search',
        type: options.method || 'GET',
        query: server_params(options, query),
        data: data,
        options: options
      });
    },

     /**
      * Search CloudMine for text objects.
      * Results may be affected by defaults and/or by the options parameter.
      * @param {string} klass The Elasticsearch __class__ you want to query.
      * @param {string} query The Elasticsearch query to be executed.
      * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters.
      * @return {APICall} An APICall instance for the web service request used to attach events.
      */
    searchES: function(klass, query, options) {
      if(isObject(query)) query = JSON.stringify(query);
      options = opts(this, options);
      options.version = 'v2';
      return new APICall({
        action: 'class/' + klass + '/elasticsearch',
        type: 'POST',
        data: query,
        options: options
      });
    },

    /**
     * Search CloudMine for user-level ACLs.
     * Results may be affected by defaults and/or by the options parameter.
     * @param {string} query The query to be used when searching for target ACLs.
     * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     */
   searchACLs: function(query, options) {
     query = {q: query != null ? convertQueryInput(query) : ''}
     options = opts(this, options);
     return new APICall({
       action: 'access/search',
       type: 'GET',
       query: server_params(options, query),
       options: options
     });
   },


    /**
     * Search CloudMine explicitly querying for files.
     * Note: This does not search the contents of files.
     * Results may be affected by defaults and/or by the options parameter.
     * @param {string} query Additional query parameters to search for.
     * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     */
    searchFiles: function (query, options) {
      query = convertQueryInput(query);
      var newQuery = '[__type__ = "file"';

      if (!query || query.replace(/\s+/, '').length == 0) {
        newQuery += ']';
      } else if (query[0] != '[') {
        newQuery += '].' + query;
      } else {
        newQuery += (query[1] == ']' ? '' : ', ') + query.substring(1);
      }

      return this.search(newQuery, options);
    },

    /**
     * Search CloudMine user objects by custom attributes.
     * Results may be affected by defaults and/or by the options parameter.
     * @param {string} query Additional query parameters to search for in [key="value", key="value"] format.
     * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     *
     * @function
     * @name searchUsers
     * @memberOf WebService.prototype
     */
    /**
     * Search CloudMine user objects by custom attributes.
     * Results may be affected by defaults and/or by the options parameter.
     * @param {object} query Additional query parameters to search for in {key: value, key: value} format.
     * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     *
     * @function
     * @name searchUsers^2
     * @memberOf WebService.prototype
     */
    searchUsers: function(query, options) {
      query = {p: query != null ? convertQueryInput(query) : ''}
      options = opts(this, options);
      return new APICall({
        action: 'account/search',
        type: 'GET',
        query: server_params(options, query),
        options: options
      });
    },

    /**
     * Get all user objects.
     * Results may be affected by defaults and/or by the options parameter.
     * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     */

    allUsers: function(options) {
      options = opts(this, options);
      return new APICall({
        action: 'account',
        type: 'GET',
        query: server_params(options),
        options: options
      });
    },

    /**
     * Sends a push notification to your users.
     * This requires an API key with push permission.
     * @param {object} [notification] A notification object. This object can have one or more fields for dispatching the notification.
     * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     */
    pushNotification: function(notification, options) {
      options = opts(this, options);
      return new APICall({
        action: 'push',
        type: 'POST',
        query: server_params(options),
        options: options,
        data: JSON.stringify(notification)
      });
    },

    /**
     * Get specific user by id.
     * @param {string} id User id being requested.
     * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters.
     * Results may be affected by defaults and/or by the options parameter.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     */

    getUser: function(id, options) {
      options = opts(this, options);
      return new APICall({
        action: 'account/' + id,
        type: 'GET',
        query: server_params(options),
        options: options
      });
    },

    /**
     * Search using CloudMine's geoquery API.
     * @param {string} field Field to search on.
     * @param {number} longitude The longitude to search for objects at.
     * @param {number} latitude The latitude to search for objects at.
     * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters.
     * @param {string} [options.units = 'km'] The unit to use when not specified for. Can be 'km', 'mi', 'm', 'ft'.
     * @param {boolean} [options.distance = false] If true, include distance calculations in the meta result for objects.
     * @param {string|number} [options.radius] Distance around the target. If string, include units. If number, specify the unit in options.unit.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     */
    /**
     * Search using CloudMine's geoquery API.
     * @param {string} field Field to search on.
     * @param {object} target A reference object that has geo-location data.
     * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters.
     * @param {string} [options.units = 'km'] The unit to use when not specified for. Can be 'km', 'mi', 'm', 'ft'.
     * @param {boolean} [options.distance = false] If true, include distance calculations in the meta result for objects.
     * @param {string|number} [options.radius] Distance around the target. If string, include units. If number, specify the unit in options.unit.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     *
     * @function
     * @name searchGeo^2
     * @memberOf WebService.prototype
     */
    searchGeo: function(field, longitude, latitude, options) {
      var geo, options;

      // Source is 1 argument for object, 2 for lat/long
      if (isObject(longitude)) {
        options = latitude || {};
        geo = extractGeo(longitude, field);
      } else {
        if (!options) options = {};
        geo = extractGeo(longitude, latitude);
      }

      if (!geo) throw new TypeError('Parameters given do not provide geolocation data');

      // Handle radius formats
      var radius = options.radius;
      if (isNumber(radius)) radius = ', ' + radius + (options && options.units ? options.units : 'km');
      else if (isString(radius) && radius.length) {
        radius = ', ' + radius;
        if (!options.units) options.units = radius.match(/mi?|km|ft/)[0];
      }
      else radius = '';

      var locTerms = (field || 'location') + ' near (' + geo.longitude + ', ' + geo.latitude + ')' + radius;

      return this.search('[' + locTerms + ']', options);
    },

    /**
     * Upload a file stored in CloudMine.
     * @param {string} key The binary file's object key.
     * @param {file|string} file FileAPI: A HTML5 FileAPI File object, Node.js: The filename to upload.
     * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     */
    upload: function(key, file, options) {
      options = opts(this, options);
      if (!key) key = this.keygen();
      if (!options.filename) options.filename = key;

      // Warning: may not necessarily use ajax to perform upload.
      var apicall = new APICall({
        action: 'binary/' + key,
        type: 'post',
        later: true,
        encoding: 'binary',
        options: options,
        processResponse: APICall.basicResponse
      });

      function upload(data, type) {
        if (!options.contentType) options.contentType = type || defaultType;
        APICall.binaryUpload(apicall, data, options.filename, options.contentType).done();
      }

      if (isString(file) || (Buffer && file instanceof Buffer)) {
        // Upload by filename

        if (isNode) {
          if (isString(file)) file = fs.readFileSync(file);
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
          file = new Blob([ new Uint8Array(file) ], {type: options.contentType || defaultType});
        }

        reader.readAsDataURL(file);
      } else NotSupported();

      return apicall;
    },

    /**
     * Download a file stored in CloudMine.
     * @param {string} key The binary file's object key.
     * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters.
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
        query: query
      });

      // Download file directly to computer if given a filename.
      if (options.filename) {
        if (isNode) {
          apicall.setProcessor(function(data) {
            response.success[key] = fs.writeFileSync(options.filename, data, 'binary');
            return response;
          }).done();
        } else {
          function detach() {
            if (iframe.parentNode) document.body.removeChild(iframe);
          }
          var iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          document.body.appendChild(iframe);
          setTimeout(function() { iframe.src = apicall.url; }, 25);
          iframe.onload = function() {
            clearTimeout(detach.timer);
            detach.timer = setTimeout(detach, 5000);
          };
          detach.timer = setTimeout(detach, 60000);
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
     * @param {object} data An object with an email, username, and password field.
     * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters.
     * @config {object} [options.profile] Create a user with the given user profile.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     *
     * @function
     * @name createUser
     * @memberOf WebService.prototype
     */
    /**
     * Create a new user.
     * @param {string} auth The email to login as.
     * @param {string} password The password to login as.
     * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters.
     * @config {object} [options.profile] Create a user with the given user profile.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     *
     * @function
     * @name createUser^2
     * @memberOf WebService.prototype
     */
    createUser: function(auth, password, options) {
      if (isObject(auth)) options = password;
      else auth = {email: auth, password: password};
      options = opts(this, options);
      options.applevel = true;

      var payload = JSON.stringify({
        credentials: {
          email: auth.email,
          username: auth.username,
          password: auth.password
        },
        profile: options.profile
      });

      return new APICall({
        action: 'account/create',
        type: 'POST',
        options: options,
        processResponse: APICall.basicResponse,
        data: payload
      });
    },

    /**
     * Update user object of logged in user.
     * @param {object} data An object to merge into the logged in user object.
     * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     *
     * @function
     * @name updateUser
     * @memberOf WebService.prototype
     */
    /**
     * Update user object of logged in user.
     * @param {string} field The field to merge into the logged in user object.
     * @param {string} value The value to set the field to.
     * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     *
     * @function
     * @name updateUser^2
     * @memberOf WebService.prototype
     */

    updateUser: function(field, value, options) {
      if (isObject(field)) options = value;
      else {
        var out = {};
        out[field] = value;
        field = out;
      }
      options = opts(this, options);

      return new APICall({
        action: 'account',
        type: 'POST',
        options: options,
        query: server_params(options),
        data: JSON.stringify(field)
      });
    },

    /**
     * Update a user object without having a session token. Requires the use of the master key
     * @param {string} user_id the user id of the user to update.
     * @param {object} profile a JSON object representing the profile
     * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters.
     */
    updateUserMaster: function(user_id, profile, options) {
      options = opts(this, options);
      return new APICall({
        action: 'account/' + user_id,
        type: 'POST',
        options: options,
        query: server_params(options),
        data: JSON.stringify(profile)
      });
    },

    /**
     * Change a user's password
     * @param {object} data An object with email, password, and oldpassword fields.
     * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     *
     * @function
     * @name changePassword
     * @memberOf WebService.prototype
     */
    /**
     * Change a user's password
     * @param {string} user The email to change the password.
     * @param {string} oldpassword The existing password for the user.
     * @param {string} password The new password for the user.
     * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     *
     * @function
     * @name changePassword^2
     * @memberOf WebService.prototype
     */
    changePassword: function(auth, oldpassword, password, options) {
      if (isObject(auth)) options = oldpassword;
      else auth = {email: auth, oldpassword: oldpassword, password: password};
      options = opts(this, options);
      options.applevel = true;

      var payload = JSON.stringify({
        email: auth.email,
        username: auth.username,
        password: auth.oldpassword,
        credentials: {
          password: auth.password
        }
      });

      return new APICall({
        action: 'account/password/change',
        type: 'POST',
        data: payload,
        options: options,
        processResponse: APICall.basicResponse
      });
    },

    /**
     * Update a user password without having a session token. Requires the use of the master key
     * @param {string} user_id The id of the user to change the password.
     * @param {string} password The new password for the user.
     * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     */
    changePasswordMaster: function(user_id, password, options) {
      options = opts(this, options);

      var payload = JSON.stringify({
        password: password
      });

      return new APICall({
        action: 'account/' + user_id + '/password/change',
        type: 'POST',
        options: options,
        processResponse: APICall.basicResponse,
        data: payload
      });
    },

    /**
     * Change a user's credentials: user/email and/or password
     * @param {object} auth An object with email, username, password, and new_password, new_email, new_username fields.
     * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     *
     * @function
     * @name changeCredentials
     * @memberOf WebService.prototype
     */
    changeCredentials: function(auth, options) {
      options = opts(this, options);
      options.applevel = true;

      var payload = JSON.stringify({
        email: auth.email,
        username: auth.username,
        password: auth.password,
        credentials: {
          password: auth.new_password,
          username: auth.new_username,
          email: auth.new_email
        }
      });

      return new APICall({
        action: 'account/credentials',
        type: 'POST',
        data: payload,
        options: options,
        processResponse: APICall.basicResponse
      });
    },


    /**
     * Initiate a password reset request.
     * @param {string} email The email to send a reset password email to.
     * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     */
    resetPassword: function(email, options) {
      options = opts(this, options);
      options.applevel = true;
      var payload = JSON.stringify({
        email: email
      });

      return new APICall({
        action: 'account/password/reset',
        type: 'POST',
        options: options,
        processResponse: APICall.basicResponse,
        data: payload
      });
    },

    /**
     * Change the password for an account from the token received from password reset.
     * @param {string} token The token for password reset. Usually received by email.
     * @param {string} newPassword The password to assign to the user.
     * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters.
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
        data: payload,
        processResponse: APICall.basicResponse,
        options: options
      });
    },

    /**
     * Login as a user to access user-level data.
     * @param {object} data An object hash with email / username, and password fields.
     * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     *
     * @function
     * @name login
     * @memberOf WebService.prototype
     */
    /**
     * Login as a user to access user-level data.
     * @param {string} auth The email of the user to login as
     * @param {string} password The password for the user
     * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     *
     * @function
     * @name login^2
     * @memberOf WebService.prototype
     */
    login: function(auth, password, options) {
      if (isObject(auth)) options = password;
      else auth = {email: auth, password: password};
      options = opts(this, options);
      options.applevel = true;

      // Wipe out existing login information.
      this.options.email = null;
      this.options.username = null;
      this.options.session_token = null;

      if (options.savelogin) {
        store('email', null, this.options.appid);
        store('username', null, this.options.appid);
        store('session_token', null, this.options.appid);
      }

      var payload = JSON.stringify({
        username: auth.username,
        email: auth.email,
        password: auth.password
      })

      var self = this;
      return new APICall({
        action: 'account/login',
        type: 'POST',
        options: options,
        data: payload,
        processResponse: APICall.basicResponse
      }).on('success', function(data) {
        if (options.savelogin) {
          store('email', auth.email, self.options.appid);
          store('username', auth.username, self.options.appid);
          store('session_token', data.session_token, self.options.appid);
        }
        self.options.email = auth.email;
        self.options.username = auth.username;
        self.options.session_token = data.session_token;
      });
    },

    /**
     * Login a user via a social network credentials.
     * This only works for browsers (i.e. not in a node.js environment) and requires user interaction (a browser window).
     * @param {string} network A network to authenticate against. @see WebService.SocialNetworks
     * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters.
     * @config {string} [options.link] If false, do not link social network to currently logged in user.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     */
    loginSocial: function(network, options) {
      // This does not work with Node.JS, or unrecognized services.
      if (isNode) NotSupported();
      options = opts(this, options);
      options.applevel = true;

      var challenge = uuid(), self = this;
      var apicall = new APICall({
        action: 'account/social/login/status/'+challenge,
        options: options,
        later: true,
        processResponse: function(data) {
          if (data.finished) {
            self.options.session_token = data.session_token;
            self.options.userid = data.profile.__id__;
            data = { success: data }
          }
          else {
            self.options.session_token = null;
            self.options.userid = null;
            data = { errors: [ "Login unsuccessful." ] }
          }

          if (options.savelogin) {
            store('session_token', data.success.session_token, self.options.appid);
            store('userid', data.success.profile.__id__, self.options.appid);
          }

          return data;
        }
      });

      var url = this.options.apiroot+"/v1/app/"+options.appid+"/account/social/login";

      var urlParams = {
        service: network,
        apikey: options.apikey,
        challenge: challenge
      };

      if (this.options.session_token && options.link !== false) {
        urlParams.session_token = this.options.session_token;
      }

      if (options.scope) urlParams.scope = options.scope;

      var sep = url.indexOf("?") === -1 ? "?" : "&";
      url = url + sep + stringify(urlParams);

      var win = window.open(url, challenge, "width=600,height=400,menubar=0,location=0,toolbar=0,status=0");

      function checkOpen() {
        if (win.closed) {
          clearTimeout(checkOpen.interval);
          apicall.done();
        }
      }
      checkOpen.interval = setInterval(checkOpen, 50);

      return apicall;
    },

    /**
     * Query a social network.
     * Must be logged in as a user who has logged in to a social network.
     * @param {object} query An object with the parameters of the query.
     * @config {string} query.network A network to authenticate against. @see WebService.SocialNetworks
     * @config {string} query.endpoint The endpoint to hit, on the social network side. See the social network's documentation for more details.
     * @config {string} query.method HTTP verb to use when querying.
     * @config {object} query.headers Extra headers to pass in the HTTP request to the social network.
     * @config {object} query.params Extra parameters to pass in the HTTP request to the social network.
     * @config {string} query.data Data to pass in the body of the HTTP request.
     * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters.
     * @throws {Error} If the user is not logged in.
     * @throws {Error} If query.headers is truthy and not an object.
     * @throws {Error} If query.params is truthy and not an object.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     */
    socialQuery: function(query, options) {
      options = opts(this, options);

      if(!options.session_token) throw new Error("Must be logged in to perform a social query");
      if(query.headers && !isObject(query.headers)) throw new Error("Headers must be an object");
      if(query.params && !isObject(query.params)) throw new Error("Extra parameters must be an object");

      var url = "social/"+query.network+"/"+query.endpoint;

      var urlParams = {};

      if(query.headers) urlParams.headers = query.headers;
      if(query.params) urlParams.params = query.params;

      var apicall = new APICall({
        action: url,
        type: query.method,
        query: urlParams,
        options: options,
        data: query.data,
        contentType: 'application/octet-stream'
      });

      return apicall;
    },

    /**
     * Logout the current user.
     * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     */
    logout: function(options) {
      options = opts(this, options);
      options.applevel = true;

      var token = this.options.session_token;
      this.options.email = null;
      this.options.username = null;
      this.options.session_token = null;

      if (options.savelogin) {
        store('email', null, this.options.appid);
        store('username', null, this.options.appid);
        store('session_token', this.options.appid);
      }

      return new APICall({
        action: 'account/logout',
        type: 'POST',
        processResponse: APICall.basicResponse,
        headers: {
          'X-CloudMine-SessionToken': token
        },
        options: options
      });
    },

    /**
     * Verify if the given login and password is valid.
     * @param {object} data An object with email / username, and password fields.
     * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     *
     * @function
     * @name verify
     * @memberOf WebService.prototype
     */
    /**
     * Verify if the given email and password is valid.
     * @param {string} auth The email to login
     * @param {string} password The password of the user to login
     * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     *
     * @function
     * @name verify^2
     * @memberOf WebService.prototype
     */
    verify: function(auth, password, options) {
      if (isObject(auth)) opts = password;
      else auth = {email: auth, password: password};
      options = opts(this, options);
      options.applevel = true;

      return new APICall({
        action: 'account/login',
        type: 'POST',
        processResponse: APICall.basicResponse,
        data: JSON.stringify(auth),
        options: options
      });
    },

    /**
     * Delete a user.
     * If you are using the master api key, omit the user password to delete the user.
     * If you are not using the master api key, provide the user name and password in the corresponding
     * email and password fields.
     *
     * @param {object} data An object that may contain email / username fields and optionally a password field.
     * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     *
     * @function
     * @name deleteUser
     * @memberOf WebService.prototype
     */
    /**
     * Delete a user.
     * If you are using the master api key, omit the user password to delete the user.
     * If you are not using the master api key, provide the user name and password in the corresponding
     * email and password fields.
     *
     * @param {string} email The email of the user to delete. If using a master key use a user id.
     * @param {string} password The password for the account. Omit if using a master key.
     * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     *
     * @function
     * @name deleteUser^2
     * @memberOf WebService.prototype
     */
    deleteUser: function(auth, password, options) {
      if (isObject(auth)) options = password;
      else auth = {email: auth, password: password}
      options = opts(this, options);
      options.applevel = true;

      var config = {
        action: 'account',
        type: 'DELETE',
        options: options,
        processResponse: APICall.basicResponse
      };

      // Drop session if we are referring to ourselves.
      if (auth.email == this.options.email) {
        this.options.session_token = null;
        this.options.email = null;

        if (options.savelogin) {
          store('email', null, this.options.appid);
          store('username', null, this.options.appid);
          store('session_token', null, this.options.appid);
        }
      }

      if (auth.password) {
        // Non-master key access
        config.data = JSON.stringify({
          email: auth.email,
          username: auth.username,
          password: auth.password
        })
      } else {
        // Master key access
        config.action += '/' + auth.email;
      }

      return new APICall(config);
    },

    /**
     * Create or update an ACL rule for user-level objects. The API will automatically generate
     * an id field if an __id__ attribute is not present. If it is, the ACL rule is updated.
     *
     * @param {object} acl The ACL object. See CloudMine documentation for reference. Example:
     *   {
     *     "__id__": "a4f84f89b2f14a87a3faa87289d72f98",
     *     "members": ["8490e9c8d6d64e6f8d18df334ae4f4fb", "ecced9c0c4bd41f0ab0dcb93d2840fd8"],
     *     "permissions": ["r", "u"],
     *     "segments": {
     *       "public": true,
     *       "logged_in": true
     *     },
     *     "my_extra_info": 12345
     *   }
     *
     * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     *
     * @function
     * @name updateACL
     * @memberOf WebService.prototype
     */
    updateACL: function(acl, options){
      options = opts(this, options);

      return new APICall({
        action: 'access',
        type: 'PUT',
        processResponse: APICall.basicResponse,
        data: JSON.stringify(acl),
        options: options
      });
    },
    /**
     * Deletes an ACL via id.
     *
     * @param {string} aclid The ACL id value to be deleted.
     *
     * @param {object} [options] Override defaults set on WebService. See WebService constructor for parameters.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     *
     * @function
     * @name deleteACL
     * @memberOf WebService.prototype
     */
    deleteACL: function(aclid, options){
      options = opts(this, options);

      return new APICall({
        action: 'access/' + aclid,
        type: 'DELETE',
        processResponse: APICall.basicResponse,
        options: options
      });
    },
    /**
     * Get an ACL rule for user-level objects by id.
     *
     * @param {string} aclid The id of the ACL object to fetch.
     * @return {APICall} An APICall instance for the web service request used to attach events.
     *
     * @function
     * @name updateACL
     * @memberOf WebService.prototype
     */
    getACL: function(aclid, options){
      options = opts(this, options);

      return new APICall({
        action: 'access/' + aclid,
        type: 'GET',
        processResponse: APICall.basicResponse,
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
      return this.options.email;
    },

    /**
     * Get the current session token.
     * @return {string} The current session token, if logged in.
     */
    getSessionToken: function() {
      return this.options.session_token;
    },

    /**
     * Get the current email.
     * @return {string} The logged in email, if logged in.
     */
    getEmail: function() {
      return this.options.email;
    },

    /**
     * Get the current username.
     * @return {string} The logged in username, if logged in.
     */
    getUsername: function() {
      return this.options.username;
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
     * @param {boolean|undefined} state If true, this store will only operate in application data.
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
    },

    keygen: uuid
  };

  WebService.VERSION = version;

  // Supported Social Networks
  WebService.SocialNetworks = [
    'bodymedia',
    'dropbox',
    'facebook',
    'fitbit',
    'flickr',
    'foursquare',
    'gcontacts',
    'gdocs',
    'github',
    'gmail',
    'google',
    'gplus',
    'instagram',
    'linkedin',
    'meetup',
    'runkeeper',
    'tumblr',
    'twitter',
    'withings',
    'wordpress',
    'yammer',
    'zeo'
  ];

  /**
   * Set the X-Unique-ID to be used in all WebService requests. This function allows it to be set
   * on before the WebService object is instantiated.
   */
  WebService.setXUniqueID = function(xUniqueID) {
    global._$XUniqueID = xUniqueID;
  }

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

    var agent = 'JS/' + version;
    var opts = this.config.options;
    if (opts.appname) {
      agent += ' ' + opts.appname.replace(agentInvalid, '_');
      if (opts.appversion) {
        agent += '/' + opts.appversion.replace(agentInvalid, '_');
      }
    }

    // Fields that are available at the completion of the api call.
    this.additionalData = this.config.callbackData;
    this.data = null;
    this.hasErrors = false;
    this.requestData = this.config.data;
    this.requestHeaders = {
      'X-CloudMine-ApiKey': opts.apikey,
      'X-CloudMine-Agent': agent,
      'X-CloudMine-UT': opts.user_token
    };

    if (typeof(global) != 'undefined' && typeof global._$XUniqueID != 'undefined') {
      this.requestHeaders['X-Unique-Id'] = global._$XUniqueID
    }

    this.responseHeaders = {};
    this.responseText = null;
    this.status = null;
    this.type = this.config.type || 'GET';

    // Build the URL and headers
    var query = stringify(server_params(opts, this.config.query));
    var root = '/', session = opts.session_token, applevel = opts.applevel;
    if (applevel === false || (applevel !== true && session != null)) {
      if (config.action.split('/')[0] !== 'account'){
        root = '/user/';
      }
      if (session != null) this.requestHeaders['X-CloudMine-SessionToken'] = session;
    }

    // Merge in headers in case-insensitive (if necessary) manner.
    for (var key in this.config.headers) {
      mapInsensitive(this.requestHeaders, key, this.config.headers[key]);
    }

    this.config.headers = this.requestHeaders;

    if (!isEmptyObject(perfComplete)) {
      this.config.headers['X-CloudMine-UT'] += ';' + stringify(perfComplete, ':', ',', null, PERF_HEADER_LIMIT);
      perfComplete = {};
    }

    this.setContentType(config.contentType || 'application/json');
    var endpointVersion = this.config.options.version || 'v1';
    var versionPath = '/' + endpointVersion + '/app/';
    this.url = [this.config.options.apiroot, versionPath, this.config.options.appid, root, this.config.action].join("");

    var sep = this.url.indexOf('?') === -1 ? '?' : '&';
    this.url = [this.url, (query ? sep + query : "")].join("");

    var self = this, sConfig = this.config, timestamp = +(new Date);
    /** @private */
    this.config.complete = function(xhr, status) {
      var data;
      if (xhr) {
        data = xhr.responseText
        self.status = xhr.status;
        self.responseText = data;
        self.responseHeaders = unstringify(xhr.getAllResponseHeaders(), /:\s*/, /(?:\r|\n)?\n/);

        // Performance metrics, if applicable.
        var requestId = mapInsensitive(self.responseHeaders, 'X-Request-Id');
        if (requestId) perfComplete[requestId] = +(new Date) - timestamp;

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
        if(!self.config.cancel)
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
        mapInsensitive(this.requestHeaders, 'content-type', type);
        mapInsensitive(this.config.headers, 'content-type', type);
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
      } else if (this.config) {
        this.config.complete.call(this, this.xhr, 'abort');
      }

      // Cleanup leftover state.
      if (this.xhr) {
        this.xhr = undefined;
        delete this.xhr;
      }
      if (this.config) {
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
          }, 1);
        } else {
          this.xhr = ajax(this.url, this.config);
        }
      }
      return this;
    },

    /**
     * Get a response header using case insensitive searching
     * Note: It is faster to use the exact casing as no searching is necessary when matching.
     * @param {string} key The header to retrieve, case insensitive.
     * @return {string|null} The value of the header, or null
     */
    getHeader: function(key) {
      return mapInsensitive(this.responseHeaders, key);
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
          var error = data.errors[k], code = 400;

          // Unfortunately, errors are a bit inconsistent.
          if (error.code) {
            code = error.code;
            error = error.message || error;
          } else if (isString(error)) {
            code = errors[error.toLowerCase()] || 400;
          }

          if (!out.errors[code]) out.errors[code] = {}
          out.errors[code][k] = {errors: [ error ]};
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
    return {success: data || {}};
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


  // Cache ids for perfAPICall
  var perfComplete = {};

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

    // Authenticate request if we have authentication information.
    if (config.username || config.password) {
      opts.headers.Authorization = "Basic " + btoa(config.username + ':' + config.password);
    }

    // Attach a content-length
    // Prevent node.js from sending transfer-encoding:chunked when there is no body
    config.data = config.data || '';
    if (isArray(config.data)) opts.headers['content-length'] = Buffer.byteLength(config.data);
    else if (isString(config.data)) opts.headers['content-length'] = Buffer.byteLength(config.data);

    // Fire request.
    var self = this, cbContext = config.context || this;
    this._textStatus = 'success';
    this._request = (opts.protocol === "http:" ? http : https).request(opts, function(response) {
      response.setEncoding(config.encoding || 'utf8');

      response.on('data', function(chunk) {
        self.responseText.push(chunk);
      });

      response.on('end', function () {
        self._headers = stringify(response.headers, ': ', '\n', true) || "";
        self.status = response.statusCode;

        var data;
        try {
          // Process data if necessary.
          data = self.responseText = self.responseText.join('');
          if (config.dataType == 'json' || (config.dataType != 'text' && response.headers['content-type'].match(/\bapplication\/json\b/i))) {
            data = JSON.parse(data);
          }
        } catch(e)
        {
          self._textStatus = 'parsererror';
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
      return this._headers;
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
    sort: 'sort',
    skip: 'skip',
    snippet: 'f', // Run code snippet on the data
    params: 'params', // Only applies to code snippets, parameters for the code snippet (JSON).
    dontwait: 'async', // Only applies to code snippets, don't wait for results.
    resultsonly: 'result_only', // Only applies to code snippets, only show results from code snippet.
    shared: 'shared',
    shared_only: 'shared_only',
    userid: 'userid',
    count: 'count',
    distance: 'distance', // Only applies to geo-query searches
    units: 'units', // Only applies to geo-query searches
    extended_responses: 'extended_responses' // Only applies to atomic operations
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

  // Sometimes we only get a string back as an error.
  var errors = {
    'bad request': 400,
    'permission denied': 401,
    'unauthorized': 401,
    'key does not exist': 404,
    'not found': 404,
    'conflict': 409
  };

  var PERF_HEADER_LIMIT = 20;

  // Scope external dependencies, if necessary.
  var base = this.window ? window : root;
  var defaultType = 'application/octet-stream';
  var File = base.File;
  var FileReader = base.FileReader;
  var ArrayBuffer = base.ArrayBuffer;
  var Buffer = base.Buffer;
  var CanvasRenderingContext2D = base.CanvasRenderingContext2D;
  var BinaryClasses = [ File, Buffer, CanvasRenderingContext2D, ArrayBuffer, base.Uint8Array, base.Uint8ClampedArray, base.Uint16Array, base.Uint32Array, base.Int8Array, base.Int16Array, base.Int32Array, base.Float32Array, base.Float64Array ];
  var agentInvalid = /[^a-zA-Z0-9._-]/g;

  // Utility functions.
  function hex() { return Math.round(Math.random() * 15).toString(16); }
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
    // email used to be called userid. set email to userid if they're still using that.
    if(options && options.userid && !options.email) options.email = options.userid;

    return merge({}, scope.options, options);
  }

  var propCache = {};
  var ROOT_COLLECTION = 'base';

  function retrieve(key, collection) {
    var col = getCollection(collection);
    return col[key];
  }

  function store(key, value, collection) {
    var col = getCollection(collection);
    if (col[key] != value) {
      col[key] = value;
      saveCollection(collection);
    }
    return value;
  }

  function server_params(options, map) {
    var key, value;
    if (map == null) map = {};
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
    return Array.prototype.slice.call(array, x || 0, y || array.length);
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

  function mapInsensitive(map, name, value) {
    // Find the closest name if we haven't referenced it directly.
    if (map[name] == null) {
      var lower = name.toLowerCase();
      for (var k in map) {
        if (k.toLowerCase() === lower) {
          name = k;
          break;
        }
      }
    }

    if (value !== undefined) map[name] = value;
    return map[name];
  }

  function isObject(item) {
    return item && typeof item === "object"
  }

  function isString(item) {
    return typeof item === "string"
  }

  function isNumber(item) {
    return typeof item === "number" && !isNaN(item);
  }

  function isBinary(item) {
    return isObject(item) && BinaryClasses.indexOf(item.constructor) > -1
  }

  function isArray(item) {
    if (item === null) return false;
    return isObject(item) && item.length != null
  }

  function isFunction(item) {
    return typeof item === 'function';
  }

  function isGeopoint(item) {
    return isObject(item) && item.__type__ === 'geopoint';
  }

  function extractGeo(x, y) {
    if (isNumber(x) && isNumber(y)) {
      return {latitude: y, longitude: x};
    } else if (isObject(x)) {
      // Got a field? try to extract from there.
      if (y && isGeopoint(x[y])) return extractGeo(x[y]);
      else {
        // Search current object since we didn't specify a field as y.
        var out = {
          latitude: x.latitude || x.lat || x.y,
          longitude: x.longitude || x.lng || x.x
        };
        if (isNumber(out.latitude) && isNumber(out.longitude)) return out;

        // Search first level objects since we haven't found location data yet.
        for (var key in x) {
          if (isGeopoint(x[key])) {
            return {
              latitude: x.latitude || x.lat || x.y,
              longitude: x.longitude || x.lng || x.x
            };
          }
        }
      }
    }

    return null;
  }

  function isEmptyObject(item) {
    if (item) {
      if (item % 1 === 0) {
        return false;
      }
      else {
        for (var k in item) {
          if (item.hasOwnProperty(k)) {
            return false;
          }
        }
      }
    }
    return true;
  }

  function stringify(map, sep, eol, ignore, limit) {
    sep = sep || '=';
    limit = limit == undefined ? -1 : limit;
    var out = [], val, escape = ignore ? nop : encodeURIComponent;
    var numMapped = 0;
    for (var k in map) {
      if (map[k] != null && !isFunction(map[k])){
        if(isArray(map[k])){
          map[k].forEach(function(val){
            out.push(escape(k) + sep + escape(val));
          });
        } else {
          val = isObject(map[k]) ? JSON.stringify(map[k]) : map[k];
          out.push(escape(k) + sep + escape(val));
        }
      }
      numMapped++;
      if (numMapped === limit) break;
    }
    return out.join(eol || '&');
  }

  function unstringify(input, sep, eol, ignore) {
    var out = {};

    if(isString(input)){
      input = input.split(eol || '&');
      var unescape = ignore ? nop : decodeURIComponent;
      for (var i = 0; i < input.length; ++i) {
        var str = input[i].split(sep);
        out[unescape(str.shift())] = unescape(str.join(sep));
      }
    } else {
      // error case - input is already an object
      out = input;
    }
    return out;
  }

  function merge(obj/*, in...*/) {
    for (var i = 1; i < arguments.length; ++i) {
      each(arguments[i], function(value, key, collection) {
        if (value != null) obj[key] = value;
      });
    }
    return obj;
  }

  function convertQueryInput(input) {
    if (isObject(input)) {
      var out = [];
      for (var key in input) {
        out.push(key + " = " + JSON.stringify(input[key]));
      }
      return "[" + out.join(', ') + "]";
    }
    return input;
  }

  function NotSupported() { throw new Error("Unsupported operation"); }
  function nop(s) { return s; }

  // Export CloudMine objects.
  var http, btoa, https, ajax, isNode, fs, url, getCollection, saveCollection;
  if (!this.window) {
    isNode = true;
    url = require('url');
    http = require('http');
    https = require('https');
    // in node lower than 0.12, this defaults to 5
    https.globalAgent.maxSockets = 50;
    http.globalAgent.maxSockets = 50;

    fs = require('fs');
    module.exports = { WebService: WebService };

    // Wrap the HttpRequest constructor so it operates the same as jQuery/Zepto.
    ajax = function(url, config) {
      return new HttpRequest(url, config);
    }

    // Node.JS adapter to support base64 encoding.
    btoa = function(str, encoding) {
      return new Buffer(str, encoding || 'utf8').toString('base64');
    }

    /**
     * Retreive JSON data from the given collection. This will attempt to load a .cm.(collection).json file first
     * from the current directory, and on any error, try to load the same name from the home directory.
     * @param {string} [collection="base"] The collection to retreive data from.
     * @return An object from the stored JSON data.
     * @private
     */
    getCollection = function(collection) {
      collection = 'cm.' + (collection || ROOT_COLLECTION);

      // Load the collection if it hasn't already been loaded. Try current directory, or $HOME.
      if (!propCache[collection]) {
        var locations = ['.', process.env.HOME + "/."], loc;
        while ((loc = locations.shift()) != null) {
          try {
            propCache[collection] = JSON.parse(fs.readFileSync(loc + collection + '.json', 'UTF8'));
            break;
          } catch (e) {}
        }
        if (!loc) propCache[collection] = {};
      }

      return propCache[collection];
    }

    /**
     * Save JSON data to the given collection. This will attempt to save to .cm.(collection).json file first
     * in the current directory, and on any error, try to save to the same name in the home directory.
     * @param {string} [collection="base"] The collection to save data from.
     * @throws {Error} If the file could not be saved.
     * @private
     */
    saveCollection = function(collection) {
      collection = 'cm.' + (collection || ROOT_COLLECTION);

      // Attempt to save to the current directory, or load from $HOME.
      var locations = ['.', process.env.HOME + "/."], loc;
      while ((loc = locations.shift()) != null) {
        try {
          fs.writeFileSync(loc + collection + '.json', JSON.stringify(propCache[collection] || {}), 'UTF8');
          break;
        } catch (e) {}
      }

      if (!loc) throw new Error("Could not save CloudMine session data");
    }

  } else {
    isNode = false;
    window.cloudmine = window.cloudmine || {};
    window.cloudmine.WebService = WebService;
    btoa = window.btoa;

    // Require the use of jQuery or Zepto.
    if (($ = this.jQuery || this.Zepto) != null) {
      ajax = $.ajax;
      if ($.support) $.support.cors = true
    }
    else throw new Error("Missing jQuery-compatible ajax implementation");

    /**
     * Retreive JSON data from the given collection in html5 local storage.
     * @param {string} [collection="base"] The collection to retreive data from.
     * @return An object from the stored JSON data.
     * @private
     */
    getCollection = function(collection) {
      collection = 'cm.' + (collection || ROOT_COLLECTION);

      if (!propCache[collection]) {
        try {
          propCache[collection] = JSON.parse(localStorage.getItem(collection)) || {};
        } catch (e) {
          propCache[collection] = {};
        }
      }

      return propCache[collection];
    }

    /**
     * Save JSON data to the given collection in html5 local storage.
     * @param {string} [collection="base"] The collection to save data from.
     * @private
     */
    saveCollection = function(collection) {
      collection = 'cm.' + (collection || ROOT_COLLECTION);
      localStorage.setItem(collection, JSON.stringify(propCache[collection] || {}));
    }
  }
})();
