(function($, cb){
    var settings = {
        api_url: "https://api.cloudmine.me",
        app_id: null,
        api_key: null,
        session_token: null
    };
  
    /*
      * Takes three objects. Combines the second and third and puts into first. Third object will overwrite second if they share keys.
    */
    var merge = function(to, from1, from2){
        var from_list = [from1 || {}, from2 || {}];
        for(var from in from_list){
            if(from_list.hasOwnProperty(from)){
                from = from_list[from];
                if(from){
                    for(var key in from){
                        if(from.hasOwnProperty(key)){
                            to[key] = from[key];
                        }
                    }
                }
            }
        }
        return to;
    };

    var forEach = function(fn){
        $.each(this, function(key, value){
            if( value !== forEach )
                fn(key, value);
        });
    };

    var build_url = function(opts, postfix){
        var user = opts.user ? "/user" : "";
        return opts.api_url + "/v1/app/" + opts.app_id + user + "/" + postfix;
    };

    var qs = {
        stringify: function(data){
            var ret = [];
            for (var d in data){
                if(data.hasOwnProperty(d)){
                    ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
                }
            }
            return ret.join("&");
        }
    };

    var append_to_url = function(url, params){
        if(!url) return url;

        var sep = (url.indexOf("?") > -1) ? "&" : "?";
        url += sep + qs.stringify(params);

        return url;
    };

    /**
     * Applies server-side code and paging params to the given URL
     */
    var apply_params = function(url, opts){
        var params = {};
        var valid_params = ["f", "count", "skip", "limit", "params"];
        var param;
        for(var index in valid_params){
            if(valid_params.hasOwnProperty(index)){
                param = valid_params[index];
                if(opts[param] !== undefined){
                    params[param] = opts[param];
                }
            }
        }

        return append_to_url(url, params);
    };

    var get_auth = function(user){
        return user ?
            'Basic ' + cm.Base64.encode(user.username + ':' + user.password)
            : undefined;
    }

    var make_headers = function(opts) {
        opts = merge({}, settings, opts);
        var headers = { 'X-CloudMine-ApiKey': opts.api_key };
        if(opts.session_token) {
            headers = merge({}, headers, { 'X-CloudMine-SessionToken': opts.session_token });
        }

        return headers;
    }

    var cm = {
        /**
         * Initialize the library with the APPID and API Key
         *
         * Parameter: opts
         *     An object with the following keys:
         *       app_id:  The app id
         *       api_key: The API key
         */
        init: function(opts){
            settings = merge({}, settings, opts);
        },

        /**
         * Creates a new user.
         *
         * Parameter: user
         *     An object containing "username" and "password" as fields.
         *
         * Parameter: callback
         *     A function that gets called when the operation returns.
         *
         * Parameter: opts
         *     An object with additional configuration options.
         *     Can be used to override: api_url, app_id, api_key
         */
        createUser: function(user, callbacks, opts) {
            opts = merge({}, settings, opts);

            callbacks = this._parseCallbacks(callbacks);

            var tokenUrl = opts.api_url + '/v1/app/' + opts.app_id + '/account/create';

            $.ajax(tokenUrl, {
                cache: false,
                dataType: 'text',
                crossDomain: true,
                contentType: 'application/json',
                processData: false,
                type: 'PUT',
                headers: { 'X-CloudMine-ApiKey' : opts.api_key },
                data: JSON.stringify({ email: user.username, password: user.password }),
                success: callbacks.success,
                error: callbacks.error
            });
        },

        /**
         * Login as a user. Subsequent requests will be submitted using
         * the login loken obtained from logging in.
         *
         * Parameter: user
         *     If the user doesn't have a session token, this object should contain "username" and "password" as fields.
         *     If the user does have a session token (meaning they have been logged in before), this object should contain
         *        "session_token" as a field with the user's session token as the value. You can do this if you are doing something
         *        like storing the session token in HTML5 local storage to keep them logged in between page refreshes.
         *
         * Parameter: callback
         *     A function that gets called when the operation returns. This function is passed an object with the data in
        *     the response body.
         *
         * Parameter: opts
         *     An object with additional configuration options.
         *     Can be used to override: api_url, app_id, api_key
         */
        login: function(user, callbacks, opts) {

            callbacks = this._parseCallbacks(callbacks);

            if (user.hasOwnProperty('session_token')) {
                // User is already logged in, so just set the session token.
                settings.session_token = user.session_token;
                callbacks.success.apply(this, { session_token: settings.session_token });
            } else {
                opts = merge({}, settings, opts);

                var tokenUrl = opts.api_url + '/v1/app/' + opts.app_id + '/account/login';

                $.ajax(tokenUrl, {
                    cache: false,
                    dataType: 'text',
                    crossDomain: true,
                    contentType: 'application/json',
                    dataType: 'json',
                    processData: false,
                    type: 'POST',
                    headers: { 'X-CloudMine-ApiKey' : opts.api_key, 'Authorization': get_auth(user) },
                    success: function(data, textStatus, jqXHR) {
                        settings.session_token = data.session_token;
                        callbacks.success.apply(this, arguments);
                    },
                    error: callbacks.error
                });
            }
        },

        /**
         * Logout the current user.
         *
         * Parameter: callback
         *     A function that gets called when the operation returns. This function is passed an object with the data in
         *     the response body.
         *
         * Parameter: opts
         *     An object with additional configuration options.
         *     Can be used to override: api_url, app_id, api_key, session_token
         */
        logout: function(callbacks, opts) {
            opts = merge({}, settings, opts);

            callbacks = this._parseCallbacks(callbacks);

            if(!opts.session_token)
                return; // nothing to do here

            var logoutUrl = opts.api_url + '/v1/app/' + opts.app_id + '/account/logout';
            $.ajax(logoutUrl, {
                cache: false,
                dataType: 'text',
                crossDomain: true,
                contentType: 'application/json',
                processData: false,
                type: 'POST',
                headers: { 'X-CloudMine-ApiKey' : opts.api_key, 'X-CloudMine-SessionToken': opts.session_token },
                success: function(data, textStatus, jqXHR) {
                    settings.session_token = null;
                    callbacks.success.apply(this, arguments);
                },
                error: callbacks.error
            });
        },

        /**
         * Returns true if we are currently logged in, false otherwise.
         */
        loggedIn: function() {
            return !!settings.session_token;
        },

        /**
         * Set (overwrite) new values for provided keys.
         *
         * Parameter: values
         *     An object of key/value pairs.  The keys in this object are
         *     the top-level keys in the CloudMine API.
         *
         * Parameter: callback
         *     A function that gets called when the operation returns. This function is passed an object with the data in
         *     the response body.
         *
         * Parameter: opts
         *     An object with additional configuration options.
         *     Can be used to override: api_url, app_id, api_key, method, session_token
         *     And to specify extension parameters: f, limit, count, etc.
         */
        setValues: function(values, callbacks, opts){
            opts = merge({}, settings, opts);
            var url = build_url(opts, "text");

            url = apply_params(url, opts);

            callbacks = this._parseCallbacks(callbacks);

            $.ajax(url, {
                headers: make_headers(opts),
                dataType: 'json',
                processData: false,
                type: opts.method || 'POST',
                contentType: 'application/json',
                data: JSON.stringify(values),
                success: callbacks.success,
                error: callbacks.error
            });
        },

        /**
         * Update the value for a single key
         *
         * Parameter: key
         *     The key for the value to update
         *
         * Parameter: value
         *     The object with the updated data
         *
         * Parameter: callback
         *     A function that gets called when the operation returns. This function is passed an object with the data in
         *     the response body.
         *
         * Parameter: opts
         *     An object with additional configuration options.
         *     Can be used to override: api_url, app_id, api_key, method, session_token
         *     And to specify extension parameters: f, limit, count, etc.
         */
        updateValue: function(key, value, callbacks, opts){
            var data = {};
            data[key] = value;
            // Not running _parseCallbacks here... we'll catch it in setValues
            cm.setValues(data, callbacks, merge(opts || {}, {method: "POST"}));
        },

        /**
         * Sets the value for a single key
         *
         * Parameter: key
         *     The key for the value to update
         *
         * Parameter: value
         *     The object with the data to set
         *
         * Parameter: callback
         *     A function that gets called when the operation returns. This function is passed an object with the data in
         *     the response body.
         *
         * Parameter: opts
         *     An object with additional configuration options.
         *     Can be used to override: api_url, app_id, api_key, method, session_token
         *     And to specify extension parameters: f, limit, count, etc.
         */
        setValue: function(key, value, callbacks, opts){
            var data = {};
            data[key] = value;
            // Not running _parseCallbacks here... we'll catch it in setValues
            cm.setValues(data, callbacks, merge(opts || {}, {method: "PUT"}));
        },

        /**
         * Gets key/value pairs for the specified keys
         *
         * Parameter: keys
         *     An array of key names to get.  Can be set to null to get all data.
         *
         * Parameter: callbacks
         *     Either a function that will be called with an object of succesfully
         *     retreived key/value pairs that match the request or an object
         *     with 'success' and 'error' callback functions.
         *
         * Parameter: opts
         *     An object with additional configuration options.
         *     Can be used to override: api_url, app_id, api_key, method, user
         *     And to specify extension parameters: f, limit, count, etc.
         */
        getValues: function(keys, callbacks, opts){
            opts = merge({}, settings, opts);
            var url = build_url(opts, "text");

            if(keys){
                url = append_to_url(url, {keys: keys.join(",")});
            }

            url = apply_params(url, opts);

            // If we got a function, assume it's the success function.

            callbacks = this._parseCallbacks(callbacks);

            $.ajax(url, {
                headers: make_headers(opts),
                dataType: 'json',
                success: callbacks.success,
                error: callbacks.error
            });
        },

        /**
         * DEPRECATED!  Use deleteKeys instead!
         *
         * Deletes specified key/value pairs
         *
         * Parameter: callback
         *     Gets called when the request returns.
         *
         * Parameter: keys
         *     An array of key names to delete.  Can be set to null to delete all data.
         */
        deleteValues: function(callbacks, keys, opts){
            return cm.deleteKeys(keys, callbacks, opts);
        },

        /**
         * Deletes specified key/value pairs
         *
         * Parameter: callback
         *     Gets called when the request returns.
         *
         * Parameter: keys
         *     An array of key names to delete.  Can be set to null to delete all data.
         *
         * Parameter: opts
         *     An object with additional configuration options.
         *     Can be used to override: api_url, app_id, api_key, method, user
         *     And to specify extension parameters: f, limit, count, etc.
         */
        deleteKeys: function(keys, callbacks, opts){
            opts = merge({}, settings, opts);
            var url = build_url(opts, "data");

            if(keys){
                url = append_to_url(url, {keys: keys.join(",")});
            } else {
                url = append_to_url(url, {all: true});
            }

            url = apply_params(url, opts);

            callbacks = this._parseCallbacks(callbacks);

            $.ajax(url, {
                headers: make_headers(opts),
                type: 'DELETE',
                success: callbacks.success,
                error: callbacks.error
            });
        },

        /**
         * Performs a search query
         *
         * Parameter: query
         *     A string query. See API documentation for details.
         *   Examples:
         *        [type="student"]
         *        a.b[x > 5, x < 10]
         *
         * Parameter: callback
         *     A function that will be called with an object of succesfully
         *     retreived key/value pairs that match the query
         *
         * Parameter: opts
         *     An object with additional configuration options.
         *     Can be used to override: api_url, app_id, api_key, method, user
         *     And to specify extension parameters: f, limit, count, etc.
         */
        search: function(query, callbacks, opts){
            opts = merge({}, settings, opts);
            var url = build_url(opts, "search");

            if(query){
                url = append_to_url(url, {q: query});
            }

            url = apply_params(url, opts);

            callbacks = this._parseCallbacks(callbacks);


            $.ajax(url, {
                headers: make_headers(opts),
                dataType: 'json',
                success: callbacks.success,
                error: callbacks.error
            });
        },

        /**
         * Verifies supplied user credentials
         *
         * Parameter: user
         *     An object with username and password to verify
         *
         * Parameter: callbacks
         *     An object with callbacks for various response scenarios:
         *     {
         *        valid: function(){...},  // called when the user credentials are valid
         *        created: function(){...}, // called when the user did not exist and was created
         *        unauthorized: function(){...}, // called when the user exists and credentials are invalid
         *        error: function(){...} // called on other errors: 400 and 404
         *     }
         *
         * Parameter: opts
         *     An object with additional configuration options.
         *     Can be used to override: api_url, app_id, api_key, method, user
         *     And to specify extension parameters: f, limit, count, etc.
         *
         * Returns: the composed URL
         */
        verifyUserAccount: function(user, callbacks, opts){
            opts = merge({user: user}, settings, opts);

            var url = build_url(opts, "account");

            callbacks = callbacks || {};

            $.ajax(url, {
                headers: { 'X-CloudMine-ApiKey': opts.api_key,
                           'Authorization': get_auth(opts.user) },
                type: opts.method || 'POST',
                statusCode: {
                    200: callbacks.valid || callbacks.success || function(){ },
                    201: callbacks.created || function(){ },
                    401: callbacks.unauthorized || function(){ },
                    404: callbacks.error || function(){ },
                    400: callbacks.error || function(){ }
                }
            });
        },

        /**
         * Builds and returns a URL for a file resource given its key
         *
         * Parameter: key
         *     A string key for the file resource.
         *
         * Parameter: opts
         *     An object with additional configuration options.
         *     Can be used to override: api_url, app_id, api_key, method, user
         *     And to specify extension parameters: f, limit, count, etc.
         *
         * Returns: the composed URL
         */
        getFileURL: function(key, opts){
            opts = merge({}, settings, opts);
            var url = build_url(opts, "binary");

            url += "/" + key;

            // inline API key to fetch binary data
            url = append_to_url(url, {apikey: opts.api_key});

            return url;
        },

        log: function(msg){
            window.console && console.log(msg);
        },


       /**
        * Takes any user input for callbacks and returns an object that will always work with $.ajax.success and .error. Resorts to empty functions.
        *
        * Parameter: callbacks
        *     Anything. If it's a function, it will be set as the success function with no error function.
        *     If it's an object, the success and/or error properties of it will be returned as they are. (Whatever's available). Other properties will be ignored.
        *     
        * Returns: object with 'success' and 'error' properties:
        *          { success: function(){ ... }, error: function(){ ... } }
       */
        _parseCallbacks: function(callbacks){

          // We're going to return _callbacks, which will have both success and error (empty by default)
          var _callbacks = { success: function(){}, error: function(){} };

          // If no callbacks were defined, return the empty object and run empty functions
          if (callbacks != undefined){

              // If we get a function, assume it's the success function and return with no error function
              if( typeof(callbacks) == "function" ){
                  _callbacks.success = callbacks;


              // If we get an object supply whatever properties there are
              } else if ( typeof(callbacks) == "object" ){

                  if ( callbacks.hasOwnProperty("success")){
                      _callbacks.success = callbacks.success;
                  }

                  if ( callbacks.hasOwnProperty("error")){
                    _callbacks.error = callbacks.error;
                  }
              }
          }
          
          // In the event of weirdness that we didn't capture, return empty callbacks
          return _callbacks
        },
    }

    // Base64 Library from http://www.webtoolkit.info
    cm.Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(a){var b="";var c,d,e,f,g,h,i;var j=0;a=cm.Base64._utf8_encode(a);while(j<a.length){c=a.charCodeAt(j++);d=a.charCodeAt(j++);e=a.charCodeAt(j++);f=c>>2;g=(c&3)<<4|d>>4;h=(d&15)<<2|e>>6;i=e&63;if(isNaN(d)){h=i=64}else if(isNaN(e)){i=64}b=b+this._keyStr.charAt(f)+this._keyStr.charAt(g)+this._keyStr.charAt(h)+this._keyStr.charAt(i)}return b},decode:function(a){var b="";var c,d,e;var f,g,h,i;var j=0;a=a.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(j<a.length){f=this._keyStr.indexOf(a.charAt(j++));g=this._keyStr.indexOf(a.charAt(j++));h=this._keyStr.indexOf(a.charAt(j++));i=this._keyStr.indexOf(a.charAt(j++));c=f<<2|g>>4;d=(g&15)<<4|h>>2;e=(h&3)<<6|i;b=b+String.fromCharCode(c);if(h!=64){b=b+String.fromCharCode(d)}if(i!=64){b=b+String.fromCharCode(e)}}b=cm.Base64._utf8_decode(b);return b},_utf8_encode:function(a){a=a.replace(/\r\n/g,"\n");var b="";for(var c=0;c<a.length;c++){var d=a.charCodeAt(c);if(d<128){b+=String.fromCharCode(d)}else if(d>127&&d<2048){b+=String.fromCharCode(d>>6|192);b+=String.fromCharCode(d&63|128)}else{b+=String.fromCharCode(d>>12|224);b+=String.fromCharCode(d>>6&63|128);b+=String.fromCharCode(d&63|128)}}return b},_utf8_decode:function(a){var b="";var c=0;var d=c1=c2=0;while(c<a.length){d=a.charCodeAt(c);if(d<128){b+=String.fromCharCode(d);c++}else if(d>191&&d<224){c2=a.charCodeAt(c+1);b+=String.fromCharCode((d&31)<<6|c2&63);c+=2}else{c2=a.charCodeAt(c+1);c3=a.charCodeAt(c+2);b+=String.fromCharCode((d&15)<<12|(c2&63)<<6|c3&63);c+=3}}return b}};


    cb && cb(cm);
})(jQuery, function(cm){
    window.cloudmine = cm;
});



