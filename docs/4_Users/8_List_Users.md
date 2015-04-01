# List Users in Application

To list all users in the application, use `ws.allUsers()`.

```js
ws.allUsers().on('success', function(data, response) {
  // data will contain a map of all user objects, indexed by user id; including all public data attached to
  // the user objects.
});
```

If you know the ID of a specific user, use `ws.getUser(id)`.

```js
// Lets say we had a user with id A2938BC9220DAEF03949
ws.getUser('A2938BC9220DAEF03949').on('success', function(data, response) {
  // data['A2938BC9220DAEF03949'] will have the public user object for the given user. 
});
```

{{jsEvents 'success.ok' 'error.unauthorized.notfound' 'complete'}}
