# Downloading Data

To download a file from your application to a user's computer, use `ws.download(key, {filename: "filename"})`.

```js
// Assuming you have an image in your application called "logo.png", with the key "app_logo"...
ws.download('app_logo', {filename: 'logo.png'}).on('success', function(data, response) {
  // In browsers: data.app_logo will refer to the iframe element that downloaded the specified file.
  // In Node.JS: data.app_logo will refer to the name of the file written.
});
```

{{note "Due to browser limitations, you will not know if the user cancelled the download."}}

To download binary data into a buffer, use `ws.download(key, {mode: 'buffer'})`.

```js
// Assuming you have binary data in your application with the key "binary_data"
// consisting of [0, 1, 4, 9, 16, 25, 36, 49, 64]
ws.download('binary_data', {mode: 'buffer'}).on('success', function(data, response) {
  var chars = new Uint8Array(data.binary_data);
  console.log(chars);
  // [0, 1, 4, 9, 16, 25, 36, 49, 64]
});
```

To download binary data into a UTF8 string, use `ws.download(key)`.

```js
// Assuming you have binary data in your application with the key "binary_data"
ws.download('binary_data').on('success', function(data, buffer) {
  console.log(data.binary_data);
  // Your console will be filled with binary noise.
});
```

{{jsEvents 'success.ok' 'error.unauthorized.notfound' 'complete'}}
