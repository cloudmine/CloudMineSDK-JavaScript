(function($, cb){
    var settings = {
        api_url: "https://api.cloudmine.me",
        app_id: null,
        api_key: null
    };

    var merge = function(to, from1, from2){
        var from_list = [from1 || {}, from2 || {}];
        for(from in from_list){
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
        return opts.api_url + "/v1/app/" + opts.app_id + "/" + postfix;
    };

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
         */
        setValues: function(values, callback, opts){
            opts = merge({}, settings, opts);
            var url = build_url(opts, "text");

            $.ajax(url, {
                headers: { 'X-CloudMine-ApiKey': opts.api_key },
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
         */
        getValues: function(keys, callbacks, opts){
            opts = merge({}, settings, opts);
            var url = build_url(opts, "text");

            if(keys){
                url += "?keys=" + keys.join(",");
            }

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
                headers: { 'X-CloudMine-ApiKey': opts.api_key },
                success: callback_wrapper
            });
        },

        /**
         * Deletes specified key/value pairs
         *
         * Parameter: callback
         *     Gets called when the request returns.
         *
         * Parameter: keys
         *     An array of key names to delete.  Can be set to null to delete all data.
         */
        deleteValues: function(callback, keys, opts){
            opts = merge({}, settings, opts);
            var url = build_url(opts, "data");

            if(keys){
                url += "?keys=" + keys.join(",");
            }

            $.ajax(url, {
                headers: { 'X-CloudMine-ApiKey': opts.api_key },
                type: 'DELETE',
                success: callback
            });
        },

        log: function(msg){
            window.console && console.log(msg);
        }
    };

    cb && cb(cm);
})(jQuery, function(cm){
    window.cloudmine = cm;
});



