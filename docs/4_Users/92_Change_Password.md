# Change User Password

To change a user's password you must enter the previous login credentials and a new password.

To change the user's password, use `ws.changePassword(email, old_password, new_password)`.

```js
ws.changePassword('nduba@nyu.edu', 'kp4iOr23x', 'do03dii40x').on('success', function() {
  // The password has been changed.
});
 
// Alternatively you can use the object syntax
ws.changePassword({userid: 'nduba@nyu.edu', oldpassword: 'kp4iOr23x', password: 'do03dii40x'});
```

{{jsEvents 'success.ok' 'error.unauthorized.notfound' 'complete'}}
