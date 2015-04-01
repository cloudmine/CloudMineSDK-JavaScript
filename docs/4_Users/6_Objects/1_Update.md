# Updating User Objects

Update existing fields, including deeply nested fields, by using `ws.update(key)`. If the object specified by key does not exist, it will be created.

{{note "Conflicting types will be overwritten by new values, e.g. updating a string field with an object.<br /><br />Existing object fields not included in the update call will remain in the object."}}

```js
// Assuming the ws object is a WebService instance with a logged in user
// Assume the 'myCar' object is what we had before and we changed the paint color.
// {
//   color: 'red',
//   year: 2012,
//   make: 'Mazda',
//   model: 'Protogé'
// }
 
ws.update('myCar', { color: 'black' }).on('success', function(data, response) {
  console.log(data);
  // { myCar: 'updated' }
 
  // The 'myCar' object now looks like this:
  // {
  //   color: 'black',
  //   year: 2012,
  //   make: 'Mazda',
  //   model: 'Protogé'
  // }
});
```

{{note "If the provided key doesn't exist yet, this method will create it for you just as `ws.set` would. In this case, rather than `updated` the response will say `created`."}}

{{jsEvents 'success.ok' 'error.unauthorized.notfound' 'complete'}}
