# Uploading Data

Files are accessible as binary data through `ws.upload(key, data_source)` and `ws.download(key)` methods, with readable properties using `ws.get(key)`.

To upload a file from the user's browser

1. The user must provide a file either by a file input control or drag a file into the browser (if supported).
2. The browser must support the HTML 5 File API. Firefox 3.6+, Safari 5+, Chrome 13+, and IE 10+ support File API.

To upload files from the user's computer, use `ws.upload(key, file_api_object)`.

```html
<input type="file" id="fileUploadField" />
```
```js
var inputElement = document.getElementById('fileUploadField');
 
ws.upload('mypicture', inputElement.files[0]).on('success', function(data, response) {
  console.log(data);
  // { key: 'mypicture' }
});
```

{{note "Use `null` as a key if you would like to assign a randomly generated id."}}

To upload an HTML 5 canvas as an image to your application, either refer to the canvas element itself or the 2D context using `ws.upload(key, canvas)`.

```html
<canvas id="myCanvas" width=300 height=300 />
```
```js
var canvas = document.getElementById('myCanvas');
// Alternatively:
// var canvas = document.getElementById('myCanvas').getContext('2d');
ws.upload('myCanvas', canvas).on('success', function(data, response) {
  console.log(data);
  // { key: 'myCanvas' }
});
```

With browsers that support typed arrays, or Node.JS, you can upload binary data directly to your application using `ws.upload(key, buffer)`.

```js
var buffer = new ArrayBuffer(16);
var charView = new Uint8Array(buffer);
for (var i = 0; i < charView.length; ++i) {
  charView[i] = i * i;
}
// charView = [0, 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225]
 
ws.upload('power', buffer).on('success', function(data, response) {
  console.log(data);
  // { key: 'power' }
});
```

{{note "Upload tries to rely on the File API to determine content-type. Some browsers do not expose the content-type through the File API, in which case it will default to `application/octet-stream` . You may override the content type by specifying the following as the last parameter: `{ contentType: 'content/type' }`"}}

{{jsEvents 'success.ok' 'error.unauthorized.notfound' 'complete'}}
