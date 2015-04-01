# Fetch Objects

Fetching objects is a simple way to get at specific objects that you know the IDs of or to access all application objects. This does not access objects owned by user accounts.

If you know more detail about the object you are looking for, but do not know the object ids, you might find it easier to use the [Object Search](#/javascript#searching-for-objects) feature instead.

If you want to access all objects stored in your application, use `ws.get()`:

```js
// Lets say you had earlier set an object with an id "address" and a value of:
// { address: "1400 John F Kennedy Blvd", city: "Philadelphia", state: "PA"}
// And another object with a value of 42
var response = ws.get();
response.on('success', function(data, response) {
  // Data returned on success will be keyed by id, unsorted.
  console.log(data);
  // {
  //   address: {
  //     address: "1400 John F Kennedy Blvd",
  //     city: "Philadelphia",
  //     state: "PA"
  //   },
  //   another_object: 42,
  //   ... and every other object in your application...
  // }
});
```

{{note 'Fetch operations are limited to 50 results by default. To retreive more objects you need to specify a limit, or page through results. See [Sorting and Paging](#/javascript#sorting-and-paging) for more information.'}}

To fetch a single object, simply give the key of the object:

```js
ws.get('address').on('success', function(data, response) {
  // Only the address object will be returned, but still keyed by the object id.
  console.log(data);
  // {
  //   address: {
  //     address: "1400 John F Kennedy Blvd",
  //     city: "Philadelphia",
  //     state: "PA"
  //   }
  // }
});
```
Or you can give a list of ids to fetch multiple objects:

```js
ws.get(['another_object', 'address']).on('success', function(data, response) {
  console.log(data);
  // {
  //   address: {
  //     address: "1400 John F Kennedy Blvd",
  //     city: "Philadelphia",
  //     state: "PA"
  //   },
  //   another_object: 42
  // }
});
```

{{caution 'Even if you specify a list of more than 50 items, the results will still be limited to the 50 items unless you specify a limit.'}}

{{jsEvents 'success.ok' 'error.unauthorized.notfound' 'complete'}}
