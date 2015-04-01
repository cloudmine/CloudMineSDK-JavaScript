# Fetching User Objects

Fetching user objects is a simple way to get at specific objects that you know the IDs of or to access all user objects. This does not access objects owned by the application.

If you know more detail about the object you are looking for, but do not know the object ids, you might find it easier to use the [Object Search](#/javascript#searching-for-user-objects) feature instead.

If you want to access all objects stored in your logged in user, use `ws.get()`:

```js
// Assuming the ws object is a WebService instance with a logged in user
// Lets say you had an object with an id "comedians" an the value of:
// { favorite: "Lewis Black", second: "Louis CK" }
// and another object with a value of "cheesecake"
 
var response = ws.get();
response.on('success', function(data, response) {
  // Data returned on success will be keyed by id, unsorted.
  console.log(data);
  // {
  //   comedians: {
  //     favorite: "Lewis Black",
  //     second: "Louis CK"
  //   },
  //   another_object: "cheesecake",
  //   ... and every other object in your application...
  // }
});
```

{{note "Fetch operations are limited to 50 results by default. To retreive more objects you need to specify a limit, or page through results. See Sorting and Paging for more information."}}

To fetch application objects while using a logged in WebService instance:

```js
ws.get({applevel: true}).on(function(data, response) {
  console.log(data);
  // Contents of data contains all application objects.
});
```

To fetch a single object, simply give the key of the object:

```js
ws.get('comedians').on('success', function(data, response) {
  // Only the comedians object will be returned, but still keyed by the object id.
  console.log(data);
  // {
  //   comedians: {
  //     favorite: "Lewis Black",
  //     second: "Louis CK"
  //   },
  //   another_object: "cheesecake",
  //   ... and every other object in your application...
  // }
});
```

Or you can give a list of ids to fetch multiple objects:

```js
ws.get(['another_object', 'comedians']).on('success', function(data, response) {
  console.log(data);
  // {
  //   comedians: {
  //     favorite: "Lewis Black",
  //     second: "Louis CK"
  //   },
  //   another_object: "cheesecake"
  // }
});
```

{{caution "Even if you specify a list of more than 50 items, the results will still be limited to the 50 items unless you specify a limit."}}

{{jsEvents 'success.ok' 'error.unauthorized.notfound' 'complete'}}
