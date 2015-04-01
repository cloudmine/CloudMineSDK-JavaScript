# User Login with Password

Once a user is created, you can log them in with their email and password. This method returns a session token that you can store locally and use to automatically maintain their session later.

Once the login is complete, you can access the `session_token as ws.options.session_token`.

To login a user, use `ws.login(email, password)`.

```js
ws.login('user@example.com', 'brrr212').on('success', function(data, response) {
  console.log(data);
  //    {
  //      expires: 'Fri, 31 Aug 2012 19:08:37 GMT',
  //      profile: {
  //        __id__: '52e882fb088747668af4a1670b1d46fb',
  //        __type__: 'user'
  //      },
  //      session_token: 'ffcc32dc93c94c7d8045c77e5122a89d'
  //    }
 
  // Now you can save the session token using localStorage
  localStorage.setItem('cm_session', response.session_token);
});
```

You may also login with an authentication object passed in:

```js
ws.login({
  email: "email@example.com",
  username: "username",
  password: "password"
}).on('success', function(data, response){
   console.log(data);
  //    {
  //      expires: 'Fri, 31 Aug 2012 19:08:37 GMT',
  //      profile: {
  //        __id__: '52e882fb088747668af4a1670b1d46fb',
  //        __type__: 'user'
  //      },
  //      session_token: 'ffcc32dc93c94c7d8045c77e5122a89d'
  //    }
});
```

{{warning 'Calls to Objects and Files functions after a successful login will automatically operate within the scope of the logged in user.<br /><br />For more information on how to control this behavior, see [WebService Options](#/javascript#webservice-options).'}}

### Maintaining the user session

When users come back to your app later, you can include their `session_token` when initializing your `cloudmine.WebService` object to log them in automatically and restore their session.

Here's how you can check if a `session_token` has been saved, and if so, include it when you initialize the `ws` object.

```js
var ws = new cloudmine.WebService({
  appid: '327a12c8208b4297a07f8f5fb32cfecc',
  apikey: '931734f754651d3c80521024eba8f8ec',
 
  // Restore the session token if it exists in local storage.
  session_token: (window.localStorage ? localStorage.getItem('cm_session') : null)
});
```

{{caution "To protect users' privacy, never publicly share their session_token anywhere in your app."}}

{{jsEvents 'success.ok.created' 'error.unauthorized.notfound' 'complete'}}
