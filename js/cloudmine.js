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
        init: function(opts){
            settings = merge({}, settings, opts);
        },

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

        updateValue: function(key, value, callback, opts){
            var data = {};
            data[key] = value;
            cm.setValues(data, callback, merge(opts || {}, {method: "POST"}));
        },

        setValue: function(key, value, callback, opts){
            var data = {};
            data[key] = value;
            cm.setValues(data, callback, merge(opts || {}, {method: "PUT"}));
        },

        getValues: function(callbacks, keys, opts){
            opts = merge({}, settings, opts);
            var url = build_url(opts, "text");

            if(keys){
                url += "?keys=" + keys.join(",");
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



