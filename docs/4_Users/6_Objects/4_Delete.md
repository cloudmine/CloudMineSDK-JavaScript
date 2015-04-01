# Deleting User Objects

A user object can be deleted by its ID using `ws.destroy(key)`. Multiple objects can also be deleted at the same time by using a search query.

{{caution "Delete operations cannot be undone."}}

### Deleting objects by search query

This will immediately delete all user objects that match the given search query. The IDs of all objects deleted by this query will be contained in the response body.

```js
// Assuming your ws WebService instance was used to login a user
ws.destroy(null, { query: '[__class__ = "CMCar"]' }).on('success', function(data, response) {
  console.log(data);
  // { objid1: 'deleted', objid2: 'deleted' }
});
```

To delete application objects by query while using a logged in `WebService` instance:

```js
ws.destroy(null, { applevel: true, query: '[__class__ = "CMCar"]' }).on('success', function(data, response) {
  // The matching objects were deleted from the application level, not the user level.
});
```

### Deleting objects by ID

```js
// Assuming your ws WebService instance was used to login a user
ws.destroy('car').on('success', function(data, response) {
  console.log(data);
  // { car: 'deleted' } 
});
```

To delete application objects while using a logged in `WebService` instance:

```js
ws.destroy('car2', { applevel: true }).on('success', function(data, response) {
  // This object was deleted from the application, not the logged in user.
});
```

Multiple objects can be deleted by passing an array of IDs using `ws.destroy(key[])`

```js
ws.destroy(['car1', 'car2', 'car3']).on('success', function(data, response) {
  console.log(data);
  // { car1: 'deleted', car2: 'deleted', car3: 'deleted' } 
});
```

### Deleting all user data

If you want to delete all the objects in your application, you can use `null` as the key parameter. You need to confirm this operation with a second options parameter defining `all` as `true`.

```js
ws.destroy(null, { all: true }).on('success', function(data, response) {
  console.log(data);
  // { car1: 'deleted', car2: 'deleted', car3 ... } 
});
```

{{warning "<p>**Ensure you are logged in before using this command or you may inadvertently delete all application data.**</p><p>This deletes all user objects **and** files.</p><p>Application objects and files are not affected by this operation.</p>"}}

{{jsEvents 'success.ok' 'error.unauthorized.notfound' 'complete'}}
