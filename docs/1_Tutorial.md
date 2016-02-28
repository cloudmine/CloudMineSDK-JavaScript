# Tutorial

This tutorial is going to show you how to get started with the JavaScript library.

### Initialize the Library

This tutorial assumes that you already have either installed the CloudMine library through NPM or have an HTML document already referencing the CloudMine Library. If not, you may want to read the [Getting Started](#/javascript) section before proceeding.

# Save An Object

Saving an object is easy. First create a WebService instance, create or reference the javascript object you wish to save, and use the `set()` method to persist the object in your application.

```js
// Throughout examples in the reference, any mention of "ws" refers to
// an existing WebService instance, created like this.
var ws = new cloudmine.WebService({
  appid: "123d1e8a451904465bfa9b56d85e439d",
  apikey: "04c64d92e7da6c4c33493c2d7d32e772"
});

ws.set(null, {name: "Bob", career: "Builder"}).on('success', function(data, response) {
  console.log(data);
  // { e40c2b4a0d2dbe91daaeaa6f6e2e0977e8d : 'created' }
});
```

### Observing Results

The example illustrates how to set an object on the server. Since the WebService class provides asynchrous functions, you won't know immediately after calling `set()` whether or not it was set on the server. The WebService class uses a simple event system that allows you to listen to many different kinds of events that will fire when the server has responded to your request. When you use WebService functions, they all return an object that allows you to add event handlers via the `on()` method, or if necessary remove them with the `off()` method. Adding and removing events uses the same method signature.

### Events

The WebService class emits both generic events and specific events.

### Generic Events

* **success** This event is fired for all successful changes to the server. If there is any part of the request that succeeded, it will be triggered.
* **error** This event is fired for any unsuccessful change to the server. There are a few reasons why any request won't succeed, but this is fired so you are aware of what was rejected.
* **result** This event is fired when a code snippet result data was included with your results. If no code snippet was specified, this is not included.
* **meta** This event is fired when there is meta data returned along with your results. The data returned is specific to the operation you performed, and often is not included.
* **complete** This event is fired when there are no other events to be fired. This is guaranteed to fire for any WebService call made.

### Specific events

Depending on which method you are using, or if you are operating in user data vs app data, these events may fire for different reasons. You need to look at the specific method to know why any of these events were fired.

* **ok** The request completed successfully
* **created** The request created the specified objects.
* **badrequest** The request could not be understood.
* **unauthorized** You do not have permission to access the given object, or you have an invalid API key.
* **notfound** The given object does not exist, or you have an invalid application id.
* **conflict** Could not create the given object since it conflicts with an existing object with the same id.

### Callbacks

Every event has the same function signature `function(data, response) { }`

`data` contains information returned from the server. Usually this is keyed by object ids, however, there are a few cases where it does not, such as creating a user or logging in.

`response` contains various information from the actual API call, such as the raw text sent from the server, the count of objects that correspond with the API call, and http headers.

# Create a Custom Object

The JavaScript Library operates on plain javascript objects. If given a constructed object, you will need to reconstruct it later so it can adopt prototype functions. Here is a quick example how to achieve this by making the constructor accept an object.

```js
function BasicClass(obj) {
  this.name = obj.name;
}
 
BasicClass.prototype = {
  // To make it easier to figure out the class later, it is recommended to set
  // the __class__ field on the object prototype.
  __class__: 'BasicClass',
 
  test: function() {
    alert(this.name);
  },
  setName: function(name) {
    this.name = name;
  }
};
 
// Ok lets create an instance of that.
var basicInstance = new BasicClass();
basicInstance.setName('Bob');
 
ws.set('BasicClassObj', basicInstance).on('success', function(data, response) {
  // The data sent to the server looks like:
  // {
  //   BasicClassObj: {
  //     __class__: 'BasicObject',
  //     name: 'Bob'
  //   }
  // }
});
```

The JavaScript library currently does not serialize/deserialize objects into existing classes, so to deserialize it later, you can refer to the `__class__` property you added to the prototype.

```js
// Lets unset the basicInstance we made earlier.
basicInstance = null;
 
// And replace it with the copy we saved on the server
ws.get('BasicClassObj').on('success', function(data) {
  var obj = data.BasicClassObj;
  var className = obj.__class__;
  if (typeof window[className] === 'function') {
    basicInstance = window[className](obj);
  }
 
  console.log(basicInstance instanceof BasicClass);
  // true
});
```

# Get All Objects

CloudMine makes it really easy to fetch all of the objects from CloudMine's data store, so you can display them to the user.

And finally, to execute the fetch, you can use the `get()` method on your webservice instance.

```js
ws.get({limit: -1}).on('success', function(data, response) {
  console.log(data);
  // Every application object stored in CloudMine, keyed by object id.
});
```

{{note 'By default, get() will only return 50 results. The object passed to it is a [WebService Options object](#/javascript#webservice-options).<br /><br />The limit of **-1** will return every object which may result in a significant amount of data to be sent at once. See [Sorting and Paging](#/javascript#sorting-and-paging) to control how much data is sent at once.'}}

# Search for Objects

Searching for objects from within CloudMine's Java Library is a breeze.

The first step is to generate a query string. This query string must conform to CloudMine's [query syntax](#/rest_api#overview). In this case, if we want to search for all the Porsches in the data store, we can generate the following query string:

```
[__class__ = "Car", make = "Porsche"]
```

The first portion of the query ensures that we are only searching through cars, and not other types of objects. The second part, linked by a comma (which represents AND), filters all the cars based on their `make` property, and ensures that only Porsches come back in the results.

You can use the `search()` method on your WebService instance to execute the search:

```js
ws.search('[__class__ = "Car", make = "Porsche"]', function(data, response) {
  for (var id in data) {
    var obj = data[id];
    // Do something with each object
  }
});
```

# Next Steps
Now that you've seen the basics, start coding up your app! The [JavaScript Library Reference](#/javascript#application-objects) has plenty of examples to help you accomplish what you need to using CloudMine.

Also, don't forget that if you can't find what you're looking for in these docs, you are always welcome to email [CloudMine support](mailto:support@cloudmineinc.com).

Happy coding!
