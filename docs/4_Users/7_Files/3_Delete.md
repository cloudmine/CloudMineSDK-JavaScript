# Deleting User Files and Data

To delete a user file, use `ws.destroy(key)` with its key as the parameter.

```js
// Assuming ws is a WebService instance with a logged in user.
ws.destroy('mypicture').on('success', function(data, response) {
  console.log(data); 
  // { mypicture: 'deleted' }
});
```

{{caution "This cannot be undone."}}

{{jsEvents 'success.ok' 'error.unauthorized.notfound' 'complete'}}
