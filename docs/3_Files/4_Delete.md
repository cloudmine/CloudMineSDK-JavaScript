# Deleting Files

To delete a file, use `ws.destroy(key)` with its key as the parameter.

```js
ws.destroy('mypicture').on('success', function(data, response) {
  console.log(data); 
  // { mypicture: 'deleted' }
});
```

{{caution "This cannot be undone."}}

{{jsEvents 'success.ok' 'error.unauthorized.notfound' 'complete'}}
