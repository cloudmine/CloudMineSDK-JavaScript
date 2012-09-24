(function() {
  // Automatic cleanup (when possible)
  var testData = [];
  function trackedService(service, root, returnAll) {
    // Find the last tracked service.
    var item = null;
    for (var i = 0; i < testData.length; ++i) {
      if (testData[i][0] === service) {
        item = testData[i][1];
        break;
      }
    }

    // Newly tracked service.
    if (!item) {
      item = {};
      testData.push([service, item]);
    }

    // Ensure the given root exists.
    if (returnAll) return item;
    else {
      if (!root) root = "app";
      if (!item[root]) item[root] = [];
      return item[root];
    }
  }

  function track(service, key, session) {
    if (session === undefined) session = service.options.session_token
    var item = trackedService(service, session);
    var contained = false;
    for (var i = 0; i < item.length; ++i) {
      if (item[i] === key) {
        contained = true;
        break;
      }
    }

    if (!contained) item.push(key);
  }

  function cleanup(service, session) {
    var item = trackedService(service, session, session == null);
    if (session) {
      service.destroy(item, {session_token: (session === "app" ? null : session)});
    } else {
      for (var key in item) {
        service.destroy(item[key], {session_token: (key === "app" ? null : key)});
      }
    }
  }

  function reverse(data) {
    if (data && typeof data == 'object' && data.length) {
      var out = Array(data.length);
      for (var i = 0; i < data.length; ++i) { out[i] = reverse(data[i]); }
      return out;
    } else if (data && typeof data == 'object') {
      var out = {};
      for (var key in data) { if (data.hasOwnProperty(key)) out[key] = reverse(data[key]); }
      return out;
    } else if (typeof data == 'string') {
      var out = "";
      for (var i = 0, c = data.length; i < data.length; ++i) { out += data[--c]; }
      return out;
    }
    return data;
  }

  function hex() {
    return Math.round(Math.random() * 16).toString(16)
  }

  function uuid() {
    var out = Array(32), i;
    out[14] = 4;
    out[19] = ((Math.round(Math.random() * 16) & 3) | 8).toString(16);
    for (i = 0; i < 14; ++i) { out[i] = hex(); }
    for (i = 15; i < 19; ++i) { out[i] = hex(); }
    for (i = 20; i < 32; ++i) { out[i] = hex(); }
    return out.join('');
  }

  function noise(count) {
    var out = [];
    while (count-- > 0) out.push('abcdefghijklmnopqrstuvwxyz123456789_'[parseInt(Math.random() * 26)]);
    return out.join('');
  }

  function fillBuffer(data) {
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

    return buffer;
  }

  function keys(obj) {
    if (typeof Object.keys == "function") {
      return Object.keys(obj);
    } else if (typeof obj == "object") {
      var keys = [];
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          keys.push(key);
        }
      }
      return keys;
    }

    throw new TypeError("Object.keys used on non-object");
  }

  // Export objects
  Export('./util', {
    track: track,
    cleanup: cleanup,
    keys: keys,
    fillBuffer: fillBuffer,
    reverse: reverse,
    uuid: uuid,
    noise: noise,
    hex: hex
  });
})();
