(function($, cb){
    var settings = {
        api_url: "https://api.cloudmine.me",
        app_id: null,
        api_key: null
    };

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
        var valid_params = ["f", "count", "skip", "limit"];
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
         * Set (overwrite) new values for provided keys.
         *
         * Parameter: values
         *     An object of key/value pairs.  The keys in this object are
         *     the top-level keys in the CloudMine API.
         *
         * Parameter: callback
         *     Gets called with the JSON response when the request returns.
         *
         * Parameter: opts
         *     An object with additional configuration options.
         *     Can be used to override: api_url, app_id, api_key, method, usero
         *     And to specify extension parameters: f, limit, count, etc.
         */
        setValues: function(values, callback, opts){
            opts = merge({}, settings, opts);
            var url = build_url(opts, "text");

            url = apply_params(url, opts);

            $.ajax(url, {
                headers: { 'X-CloudMine-ApiKey': opts.api_key,
                           'Authorization': get_auth(opts.user) },
                dataType: 'json',
                processData: false,
                type: opts.method || 'POST',
                contentType: 'application/json',
                data: JSON.stringify(values),
                success: callback 
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
         *     Gets called with the JSON response when the request returns.
         *
         * Parameter: opts
         *     An object with additional configuration options.
         *     Can be used to override: api_url, app_id, api_key, method, user
         *     And to specify extension parameters: f, limit, count, etc.
         */
        updateValue: function(key, value, callback, opts){
            var data = {};
            data[key] = value;
            cm.setValues(data, callback, merge(opts || {}, {method: "POST"}));
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
         *     Gets called with the JSON response when the request returns.
         *
         * Parameter: opts
         *     An object with additional configuration options.
         *     Can be used to override: api_url, app_id, api_key, method, user
         *     And to specify extension parameters: f, limit, count, etc.
         */
        setValue: function(key, value, callback, opts){
            var data = {};
            data[key] = value;
            cm.setValues(data, callback, merge(opts || {}, {method: "PUT"}));
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
         *     with 'success' and 'errors' callback functions.
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

            if( typeof(callbacks) == "function" ){
                callbacks = { success: callbacks };
            }

            var callback_wrapper = callbacks && function(data){
                // data has .success and .errors
                if(data.success){
                    if(!data.success.forEach){
                        merge(data.success, {forEach: forEach});
                    }

                    callbacks.success(data.success);
                };

                if(callbacks.error){
                    if(!data.errors.forEach){
                        merge(data.errors, {forEach: forEach});
                    }
                    callbacks.error(data.errors);
                };
            };

            $.ajax(url, {
                headers: { 'X-CloudMine-ApiKey': opts.api_key,
                           'Authorization': get_auth(opts.user) },
                dataType: 'json',
                success: callback_wrapper
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
        deleteValues: function(callback, keys, opts){
            return cm.deleteKeys(keys, callback, opts);
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
        deleteKeys: function(keys, callback, opts){
            opts = merge({}, settings, opts);
            var url = build_url(opts, "data");

            if(keys){
                url = append_to_url(url, {keys: keys.join(",")});
            } else {
                url = append_to_url(url, {all: true});
            }

            url = apply_params(url, opts);

            $.ajax(url, {
                headers: { 'X-CloudMine-ApiKey': opts.api_key,
                           'Authorization': get_auth(opts.user) },
                type: 'DELETE',
                success: callback
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
        search: function(query, callback, opts){
            opts = merge({}, settings, opts);
            var url = build_url(opts, "search");

            if(query){
                url = append_to_url(url, {q: query});
            }

            url = apply_params(url, opts);

            var callback_wrapper = callback && function(data){
                // data has .success and .errors
                if(data.success && !data.success.forEach){
                    merge(data.success, {forEach: forEach});
                };

                if(data.errors && !data.errors.forEach){
                    merge(data.errors, {forEach: forEach});
                };

                callback(data);
            };

            $.ajax(url, {
                headers: { 'X-CloudMine-ApiKey': opts.api_key,
                           'Authorization': get_auth(opts.user) },
                dataType: 'json',
                success: callback_wrapper
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
                    200: callbacks.valid,
                    201: callbacks.created,
                    401: callbacks.unauthorized,
                    404: callbacks.error,
                    400: callbacks.error
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
        }
    };

    // Base64 Library from http://www.webtoolkit.info
    cm.Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(a){var b="";var c,d,e,f,g,h,i;var j=0;a=cm.Base64._utf8_encode(a);while(j<a.length){c=a.charCodeAt(j++);d=a.charCodeAt(j++);e=a.charCodeAt(j++);f=c>>2;g=(c&3)<<4|d>>4;h=(d&15)<<2|e>>6;i=e&63;if(isNaN(d)){h=i=64}else if(isNaN(e)){i=64}b=b+this._keyStr.charAt(f)+this._keyStr.charAt(g)+this._keyStr.charAt(h)+this._keyStr.charAt(i)}return b},decode:function(a){var b="";var c,d,e;var f,g,h,i;var j=0;a=a.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(j<a.length){f=this._keyStr.indexOf(a.charAt(j++));g=this._keyStr.indexOf(a.charAt(j++));h=this._keyStr.indexOf(a.charAt(j++));i=this._keyStr.indexOf(a.charAt(j++));c=f<<2|g>>4;d=(g&15)<<4|h>>2;e=(h&3)<<6|i;b=b+String.fromCharCode(c);if(h!=64){b=b+String.fromCharCode(d)}if(i!=64){b=b+String.fromCharCode(e)}}b=cm.Base64._utf8_decode(b);return b},_utf8_encode:function(a){a=a.replace(/\r\n/g,"\n");var b="";for(var c=0;c<a.length;c++){var d=a.charCodeAt(c);if(d<128){b+=String.fromCharCode(d)}else if(d>127&&d<2048){b+=String.fromCharCode(d>>6|192);b+=String.fromCharCode(d&63|128)}else{b+=String.fromCharCode(d>>12|224);b+=String.fromCharCode(d>>6&63|128);b+=String.fromCharCode(d&63|128)}}return b},_utf8_decode:function(a){var b="";var c=0;var d=c1=c2=0;while(c<a.length){d=a.charCodeAt(c);if(d<128){b+=String.fromCharCode(d);c++}else if(d>191&&d<224){c2=a.charCodeAt(c+1);b+=String.fromCharCode((d&31)<<6|c2&63);c+=2}else{c2=a.charCodeAt(c+1);c3=a.charCodeAt(c+2);b+=String.fromCharCode((d&15)<<12|(c2&63)<<6|c3&63);c+=3}}return b}};


    cb && cb(cm);
})(jQuery, function(cm){
    window.cloudmine = cm;
});



