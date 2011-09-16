(function($) {
  
  var baseUrl = 'https://api.cloudmine.me/v1/app/';
  $.cm = {
    getJSON: function(appid, apikey, keys, callback) {
      var url = baseUrl + appid + '/text';
      $.ajax(url, {
        headers: { 'X-CloudMine-ApiKey': apikey },
        success: callback
      });
    },

    replaceJSON: function(appid, apikey, data, callback) {
      var url = baseUrl + appid + '/text';
      $.ajax(url, {
        headers: { 'X-CloudMine-ApiKey': apikey },
        processData: false,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: callback 
      });
    },

    insertValueForKey: function(appid, apikey, key, value, callback) {
      var data = {};
      data[key] = value;
      this.replaceJSON(appid, apikey, data, callback);
    }
  };

})(jQuery);
