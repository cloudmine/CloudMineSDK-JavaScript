# Create User

{{note 'If you want to create a user account using a social network such as Facebook, Twitter or Instagram you should head over to [User Login with Social Network](#/javascript#user-login-with-social-network) and ignore this section as it does not apply.'}}

All data stored in a user object is public and is meant for users to find each other based on various attributes. **Do not store private data inside of a user object**. Instead, [create a new object](#/javascript#saving-user-objects) while the user is logged in. This creates data that is private to that user.

To create a user, use `ws.createUser(email, password)`.

```js
ws.createUser('nduba@nyu.edu', 'kp4iOr23x').on('success', function(data, response) {
  console.log(data);
  // {
  //    __id__: '52e882fb088747668af4a1670b1d46fb',
  //    __type__: 'user'
  // }
});
 
// Alternatively you can use the object syntax:
// ws.createUser({email: 'nduba@nyu.edu', password: 'kp4i0r23x'});
```

{{note "This does not log the user in automatically. You can call `ws.login` inside the success callback using the same credentials to automatically log in newly registered users."}}

{{jsEvents 'success.created' 'error.unauthorized.notfound.conflict' 'complete'}}
