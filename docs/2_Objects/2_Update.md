# Updating Objects

Update existing fields, including deeply nested fields, by using `ws.update(key)`. If the object specified by key does not exist, it will be created.

{{note "Conflicting types will be overwritten by new values, e.g. updating a string field with an object.<br /><br />Existing object fields not included in the update call will remain in the object."}}

```js
// Assume the 'car' object is what we had before
// { 
//   color: 'red',
//   make: 'Porsche' 
// }
 
ws.update('car', { color: 'pink' }).on('success', function(data, response) {
  console.log(data);
  // { car: 'updated' }
 
  // The 'car' object now looks like this:
  // { 
  //   color: 'pink', 
  //   make: 'Porsche' 
  // }
});
```

{{note "If the provided key doesn't exist yet, this method will create it for you just as ws.set would. In this case, rather than 'updated' the response will say 'created'."}}

{{jsEvents 'success.ok' 'error.unauthorized.notfound' 'complete'}}

