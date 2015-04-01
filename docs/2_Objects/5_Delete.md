# Deleting Objects

An object can be deleted by its ID using `ws.destroy(key)`. Multiple objects can also be deleted at the same time by using a search query.

{{caution "Delete operations cannot be undone."}}

### Deleting objects by search query

This will immediately delete all objects that match the given search query. The IDs of all objects deleted by this query will be contained in the response body.

```js
ws.destroy(null, { query: '[__class__ = "CMCar"]' }).on('success', function(data, response) {
  console.log(data);
  // { objid1: 'deleted', objid2: 'deleted' }
});
```

### Deleting objects by ID

```js
ws.destroy('car').on('success', function(data, response) {
  console.log(data);
  // { car: 'deleted' } 
});
```

Multiple objects can be deleted by passing an array of IDs using `ws.destroy(key[])`

```js
ws.destroy(['car1', 'car2', 'car3']).on('success', function(data, response) {
  console.log(data);
  // { car1: 'deleted', car2: 'deleted', car3: 'deleted' } 
});
```

### Deleting all data

If you want to delete all the objects in your application, you can use `null` as the key parameter. You need to confirm this operation with a second options parameter defining `all` as `true`.

```js
ws.destroy(null, { all: true }).on('success', function(data, response) {
  console.log(data);
  // { car1: 'deleted', car2: 'deleted', car3 ... } 
});
```

{{warning "This deletes all application objects **and** files.<br /><br />User objects and files are not affected by this operation."}}

{{jsEvents 'success.ok' 'error.unauthorized.notfound' 'complete'}}
