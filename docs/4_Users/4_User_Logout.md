# User Logout

Logging a user out will clear the `session_token` stored on the `ws.options` configuration object in your webservice instance.

If you stored the session token elsewhere, make sure to remove it there since the session token will no longer be valid.

To log out the currently logged in user, use `ws.logout()`.

```javascript
ws.logout().on('success', function() {
  // Clear the locally-stored session_token which is no invalid.
  window.localStorage && localStorage.removeItem('cm_session');
});
```

{{warning "Calls to Objects and Files functions after logout will automatically operate within the scope of the application.<br /><br />For more information on how to control this behavior, see WebService Options."}}

{{jsEvents 'success.ok.created' 'error.unauthorized.notfound' 'complete'}}
