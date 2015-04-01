# EXECUTABLE CODE SNIPPETS

Custom code execution allows you to write custom JavaScript code snippets that run on our servers to perform processing and post-processing operations that are inappropriate to run on a mobile device or to offload certain business logic to the server. Your code runs in a sandboxed server-side JavaScript environment that has access to the CloudMine [JavaScript API](http://github.com/cloudmine/cloudmine-js) and a simple HTTP client. All snippets are killed after 30 seconds of execution.

## Code Snippet Usage

Server-side snippets are invoked in the JavaScript Library by using WebService options on any of the WebService calls.

Lets assume the Code Snippet looks like this:

```js
var className = data.params.classname;
 
var output = {};
for (var key in data.input) {
  output[key] = data.input[key].__class__ == className;
}
 
exit(output);
```

```js
// Remember the BasicObject we created in the tutorial?
// Lets assume we still have it around.
 
ws.set('BasicObject', basicInstance, {
  snippet: 'verifyClass',
  params: {
    'classname': 'BasicClass'
  }
}).on('result', function(data, response) {
  console.log(data);
  // {
  //   BasicObject: true
  // }
});
```

## Code Snippet Options

The [WebService Options](#/javascript#webservice-options) object has a few options to control code snippet execution.

* `{ resultsonly: boolean }` Only include the results of the snippet call in the response.

* `{ dontwait: boolean }` Don't wait for the snippet execution to complete before returning.

* `{ params: object }` These will be passed into the snippet as parameters.
