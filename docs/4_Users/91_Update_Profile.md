# Update User Profile

To update fields on the currently logged in user's object, use `ws.updateUser(object)`.

{{note "Fields in the given object will be merged into the current user object."}}

```js
// Assume the ws object is a WebService instance with a logged in user.
// Lets also assume we already have a "favoriteAnimal" field with the value "cat".
ws.updateUser({
  favoriteColor: "blue"
}).on('success', function(data, response) {
  console.log(data);
  // Keyed on the users id, the user object will contain
  // {
  //   favoriteAnimal: "cat",
  //   favoriteColor: "blue"
  // }
});
```

{{jsEvents 'success.ok' 'error.unauthorized.notfound' 'complete'}}
