
(function() {
  /*
   * Constructor
   *
   * @param {Object} options Data which sets up the Cloudmine WebService object to communicate with your app through your api key. Takes the following:
   *   apikey: Generated on the Cloudmine dashboard (https://cloudmine.me/dashboard/apps), an API key with specific permissions you set for your app
   *   appid:  Your app's identifier, which you can find in the same place as the API key.
   *   
   *
   */

  function WebService(options) {
    this.options = options || {};
  }

  /*
   * Get one, many given keys, or all keys from CloudMine.
   * @param {String|String[]|null} keys If omitted get all keys, if a string, a single key, otherwise return many keys.
   */

  WebService.prototype = {
    get: function(keys, opts) {
      opts = opts ? merge({}, this.options, opts) : this.options;
      keys = {
        keys: isArray(keys) ? keys.join(',') : keys
      };

      return new APICall({
        action: 'text',
        appkey: this.options.appkey,
        apikey: this.options.apikey,
        method: 'GET',
        options: opts,
        query: server_params(opts, keys)
      });
    },

    update: function(key, value, opts) {
      if (!isObject(key)) key = { key: key, value: value }
      else opts = value;
      opts = opts ? merge({}, this.options, opts) : this.options;

      return new APICall({
        action: 'text',
        method: 'POST',
        appkey: this.options.appkey,
        apikey: this.options.apikey,
        options: opts,
        query: server_params(opts),
        data: JSON.stringify(keys)
      });
    },

    set: function(key, value, opts) {
      if (!isObject(key)) key = { key: key, value: value }
      else opts = value;
      opts = opts ? merge({}, this.options, opts) : this.options;

      return new APICall({
        action: 'text',
        method: 'PUT',
        appkey: this.options.appkey,
        apikey: this.options.apikey,
        options: opts,
        query: server_params(opts),
        data: JSON.stringify(keys)
      });
    },

    destroy: function(keys, opts) {
      opts = opts ? merge({}, this.options, opts) : this.options;
      if (keys == null) keys = {all: true};
      else keys = isArray(keys) ? keys.join(',') : keys; 

      return new APICall({
        action: 'data',
        method: 'DELETE',
        appkey: this.options.appkey,
        apikey: this.options.apikey,
        options: opts,
        query: server_params(opts, keys)
      });
    },

    search: function(query, opts) {
      opts = opts ? merge({}, this.options, opts) : this.options;
      query = {q: query != null ? query : ""}

      return new APICall({
        action: 'search',
        method: 'GET',
        appkey: this.options.appkey,
        apikey: this.options.apikey,
        query: server_params(opts, query),
        options: opts
      });
    },

    searchFiles: function(query, opts) {
      var term = '[__type__ = "file"]';
      query = query != null ? query + "." + term : term;

      return this.search(query, opts);
    },

    createUser: function(username, password, opts) {
      opts = opts ? merge({}, this.options, opts) : this.options;
      var payload = JSON.stringify({
        username: username,
        password: password
      });

      return new APICall({
        action: 'account/create',
        method: 'POST',
        appkey: this.options.appkey,
        apikey: this.options.apikey,
        options: opts,
        processResponse: APICall.basicResponse,
        data: payload
      });
    },

    changePassword: function(username, oldPassword, newPassword, opts) {
      opts = opts ? merge({}, this.options, opts) : this.options;
      var payload = JSON.stringify({
        password: newPassword
      });
      
      return new APICall({
        action: 'account/password/change',
        method: 'POST',
        appkey: this.options.appkey,
        apikey: this.options.apikey,
        data: payload,
        options: opts,
        processResponse: APICall.basicResponse,
        headers: {
          Authorization: "Basic " + (base64.encode(username + ":" + oldPassword))
        }
      });
    },

    resetPassword: function(username, opts) {
      opts = opts ? merge({}, this.options, opts) : this.options;
      var payload = JSON.stringify({
        email: username
      });

      return new APICall({ 
        action: 'account/password/reset',
        method: 'POST',
        appkey: this.options.appkey,
        apikey: this.options.apikey,
        options: opts,
        processResponse: APICall.basicResponse,
        data: payload
      });
    },

    confirmReset: function(username, password, token, opts) {
      opts = opts ? merge({}, this.options, opts) : this.options;
      var payload = JSON.stringify({
        password: password
      });

      return new APICall({
        action: "account/password/reset/" + token,
        method: 'POST',
        appkey: this.options.appkey,
        apikey: this.options.apikey,
        data: payload,
        processResponse: APICall.basicResponse,
        options: opts
      });
    },

    /*
     * login
     * @param {Object} user
     *   username: {String} email address
     *   password: {String} password
     *     OR
     *   session_token {String} session_token from previous login (retrieved from a cookie)
     */
    login: function(user, opts) {
      // Wipe out existing login information.
      this.options.username = null;
      this.options.password = null;
      this.options.session_token = null;
      opts = opts ? merge({}, this.options, opts) : this.options;
      
      var self = this;
      return new APICall({
        action: 'account/login',
        method: 'POST',
        appkey: this.options.appkey,
        apikey: this.options.apikey,
        options: opts,
        headers: {
          Authorization: "Basic " + (base64.encode("" + user.username + ":" + user.password))
        },
        processResponse: APICall.basicResponse
      }).on('success', function(data) {
        self.options.username = data.username;
        self.options.password = data.password;
        self.options.session_token = data.session_token;
      });
    },

    logout: function(opts) {
      opts = opts ? merge({}, this.options, opts) : this.options;
      this.options.username = null;
      this.options.password = null;
      this.options.session_token = null;

      return new APICall({
        action: 'account/logout',
        method: 'POST',
        appkey: this.options.appkey,
        apikey: this.options.apikey,
        headers: {
          'X-CloudMine-SessionToken': opts.session_token
        },
        options: opts
      });
    },

    /*
     * Returns true if we are currently logged in, false otherwise.
     */
    loggedIn: function() {
      return !!this.options.session_token;
    },

    verify: function(username, password, opts) {
      opts = opts ? merge({}, this.options, opts) : this.options;
      opts.session_token = null;
      
      return new APICall({
        url: 'account',
        method: opts.method || 'POST',
        appkey: this.options.appkey,
        apikey: this.options.apikey,
        headers: {
          Authorization: "Basic " + (base64.encode(username + ":" + password))
        },
        options: opts
      });
    }
  };

  /** This class initiates the AJAX call to the server and contains request and response information.
   * @class APICall
   * @private
   * 
   * config:
   *  action: url fragment to API, e.g. "text"
   *  callbackData: additional data to store on response  Default: null
   *  contentType: content type for request               Default: "application/json"
   *  query: map of parameters to pass to the server      Default: null
   *  data: data to send to server                        Default: null
   *  dataType: Data type being sent to the server        Default: 'json'
   *  processData: Convert data to query fields. Default: false
   *  processResponse: Pre-process result with function.  Default: APICall.textResponse (no processing: APICall.basicResponse)
   */
  function APICall(config) {
    config = merge({}, defaultConfig, config);
    this._events = {};

    // Fields that are available at the completion of the api call.
    this.additionalData = config.callbackData;
    this.contentType = config.contentType;
    this.data = null;
    this.responseHeaders = {};
    this.responseText = null;
    this.status = null;


    // Build the request headers
    var session = config.options ? config.options.session_token : null;
    this.requestHeaders = config.headers = merge({
      'X-CloudMine-ApiKey': config.apikey,
      'Content-Type': config.contentType,
      'X-CloudMine-SessionToken': session
    }, config.headers);

    // Build the URL
    var query = (config.query ? ("?" + stringify(config.query)) : "");
    this.url = [cloudmine.API, "/v1/app/", config.appkey, (session ? "/user/" : "/"), config.action, query].join("");
    
    var self = this;
    config.complete = function(xhr) {
      var data, content = xhr.responseText;
      self.status = xhr.status;
      self.responseText = content;
      each(xhr.getAllResponseHeaders().split('\n'), function(item) {
        var fields = item.split(':');
        self.responseHeaders[fields.shift()] = fields.join(':');
      });

      // If we can parse the data as JSON or store the original data.
      try {
        self.data = JSON.parse(content || "{}");
      } catch (e) {
        self.data = content;
      }
      // Parse the response only if a safe status
      if (self.status >= 200 && self.status < 300) {
        // Preprocess data coming in to hash-hash: [success/errors].[httpcode]
        data = config.processResponse.call(self, self.data, xhr, self);
      } else {
        data = {errors: {}};
        data.errors[self.status] = self.data;
      }

      // Do not expose xhr object.
      delete this.xhr;

      // Data has been processed by this point and should exist in success, errors, meta, or results hashes.
      // Event firing order: http status (e.g. ok, created), http status (e.g. 200, 201), success, meta, result, error.
      if (data.success) {
        // Callback signature: function(keys, response, statusCode)
        if (http[self.status]) self.trigger(http[self.status], data.success, self, self.status, data);
        self.trigger(self.status, data.success, self, self.status);

        // Callback signature: function(keys, response);
        self.trigger('success', data.success, self);
      }

      // Callback signature: function(keys, response)
      if (data.meta) self.trigger('meta', data.meta, self);

      // Callback signature: function(keys, response)
      if (data.result) self.trigger('result', data.result, self);

      // Errors needs to fire groups of errors depending on code result.
      if (data.errors) {
        // Callback signature: function(keys, reponse, statusCode)
        for (var k in data.errors) {
          if (http[k]) self.trigger(http[k], data.errors[k], self, k);
          self.trigger(k, data.errors[k], self, k);
        }

        // Callback signature: function(keys, response)
        self.trigger('error', data.errors, self);
      }
    }

    // Let script continue before triggering ajax call
    if (config.async) {
      setTimeout(function() {
        self.xhr = ajax(self.url, config);
      }, 1);
    } else {
      this._config = config;
    }
  }

  APICall.prototype = {
    on: function(eventType, callback, context) {
      if (isFunction(callback)) {
        context = context || this;
        if (!this._events[eventType]) this._events[eventType] = [];

        // normal callback not called.
        this._events[eventType].push([callback, context, function() {
          removeCallbacks(eventType, callback, context);
          callback.apply(this, arguments);
        }]);
      }
      return this;
    },

    trigger: function(event/*, arg1...*/) {
      var events = this._events[event];
      if (events != null) {
        args = slice(arguments, 2);
        each(events, function(event) {
          event[2].apply(event[1], args);
        });
      }
    },

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

    abort: function() {
      if (!this._config) {
        this.xhr.abort();
        delete this.xhr;
        return this;
      }
    },

    done: function() {
      if (this._config) {
        this.xhr = ajax(self.url, this._config);
        delete this._config;
      }
      return this;
    }
  };

  // Use this for standard cloudmine text responses that have success/errors/meta/result fields.
  APICall.textResponse = function(data, xhr, response) {
    // Attempt to detect a standard response.
    if (data.errors || data.success || data.meta || data.result) {
      out.success = data.success;
      out.meta = data.meta;
      out.result = data.result;

      if (data.errors) {
        out.errors = {};
        for (var k in data.errors) {
          var error = data.errors[k];
          if (!out[error.code]) out[error.code] = {}
          out[error.code][k] = error;
        }
      }
    } else {
      // Code snippets may return a non-standard result, catch that case.
      out.success = data;
    }

    return out;
  };

  // Use this if you know the response is not a standard cloudmine text response.
  // E.g. Binary response.
  APICall.basicResponse = function(data, xhr, response) {
    var out = {success: {}};
    out.success[self.status] = data;
    return out;
  };

  // Remap some of the CloudMine API query parameters.
  var valid_params = {
    limit: 'limit',
    skip: 'skip',
    snippet: 'f', // Run code snippet on the data
    params: 'params',
    dontwait: 'async', // Only applies to code snippets
    resultsonly: 'result_only', // Only applies to code snippets
    count: 'count'
  };

  // Default jQuery ajax configuration.
  var defaultConfig = {
    async: true,
    contentType: 'application/json',
    processData: false,
    dataType: 'text',
    processResponse: APICall.textResponse,
    crossDomain: true,
    cache: false
  };

  // Map HTTP codes that could come from CloudMine
  var http = {
    200: 'ok',
    201: 'created',
    400: 'badrequest',
    401: 'unauthorized',
    404: 'notfound',
    409: 'conflict',
    500: 'servererror'
  };

  // Utility functions.
  var esc = window.encodeURIComponent || escape;

  function server_params(opts, map) {
    var key, value;
    if (map == null) {
      map = {};
    }
    for (key in valid_params) {
      value = valid_params[key];
      if (opts[key] != null) {
        map[value] = opts[key];
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
    if (isObject(item)) {
      context = context || this
      if (item.forEach) {
        item.forEach(callback, context);
      } else {
        for (var k in item) {
          var obj = item[k];
          if (!isFunction(obj)) callback.call(context, obj, k, context);
        }
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

  function isArray(item) {
    return item && item.length != null
  }

  function isFunction(item) {
    return typeof item === 'function';
  }
  
  function stringify(map) {
    var out = [];
    for (var k in map) {
      if (map[k] != null && !isFunction(map[k])) out.push(esc(k) + "=" + esc(map[k]));
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

  function setAJAX(func) {
    if (func) ajax = func;
    else if (($ = this.jQuery || this.Zepto) != null) ajax = $.ajax;
    else throw "Missing jQuery-compatible ajax implementation";
    return ajax;
  }  

  // Export CloudMine objects. Node will see additional methods to set the ajax implementation and API call.
  this.cloudmine = this.cloudmine || {};
  this.cloudmine.WebService = WebService;
  if (!this.cloudmine.API) this.cloudmine.API = "https://api.cloudmine.me";
  setAJAX();
  
  var base64 = {_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(a){var b="";var c,d,e,f,g,h,i;var j=0;a=base64._utf8_encode(a);while(j<a.length){c=a.charCodeAt(j++);d=a.charCodeAt(j++);e=a.charCodeAt(j++);f=c>>2;g=(c&3)<<4|d>>4;h=(d&15)<<2|e>>6;i=e&63;if(isNaN(d)){h=i=64}else if(isNaN(e)){i=64}b=b+this._keyStr.charAt(f)+this._keyStr.charAt(g)+this._keyStr.charAt(h)+this._keyStr.charAt(i)}return b},decode:function(a){var b="";var c,d,e;var f,g,h,i;var j=0;a=a.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(j<a.length){f=this._keyStr.indexOf(a.charAt(j++));g=this._keyStr.indexOf(a.charAt(j++));h=this._keyStr.indexOf(a.charAt(j++));i=this._keyStr.indexOf(a.charAt(j++));c=f<<2|g>>4;d=(g&15)<<4|h>>2;e=(h&3)<<6|i;b=b+String.fromCharCode(c);if(h!=64){b=b+String.fromCharCode(d)}if(i!=64){b=b+String.fromCharCode(e)}}b=base64._utf8_decode(b);return b},_utf8_encode:function(a){a=a.replace(/\r\n/g,"\n");var b="";for(var c=0;c<a.length;c++){var d=a.charCodeAt(c);if(d<128){b+=String.fromCharCode(d)}else if(d>127&&d<2048){b+=String.fromCharCode(d>>6|192);b+=String.fromCharCode(d&63|128)}else{b+=String.fromCharCode(d>>12|224);b+=String.fromCharCode(d>>6&63|128);b+=String.fromCharCode(d&63|128)}}return b},_utf8_decode:function(a){var b="";var c=0;var d=c1=c2=0;while(c<a.length){d=a.charCodeAt(c);if(d<128){b+=String.fromCharCode(d);c++}else if(d>191&&d<224){c2=a.charCodeAt(c+1);b+=String.fromCharCode((d&31)<<6|c2&63);c+=2}else{c2=a.charCodeAt(c+1);c3=a.charCodeAt(c+2);b+=String.fromCharCode((d&15)<<12|(c2&63)<<6|c3&63);c+=3}}return b}};

  if (this.exports) {
    this.exports = {
      WebService: WebService,
      setAJAX: setAJAX,
      setAPI: function setAPI(host) {
        this.cloudmine.API = host;
      }
    };
  }
})();

