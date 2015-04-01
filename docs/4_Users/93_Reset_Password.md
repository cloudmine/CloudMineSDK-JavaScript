# Resetting a user's password

Resetting a user's password is a multi-step process, first you must create a password reset request. The user will receive an email requesting that they confirm a password change. They may use email to reset the password, or may enter the reset token within the app to complete the password reset within your application.

### Request a password reset

To create a password reset request, use `ws.resetPassword(email)`.

```js
ws.resetPassword('nduba@nyu.edu').on('success, function() {
  // The email has been sent.
});
```

{{jsEvents 'success.ok' 'complete'}}

### Complete a password reset

To change the user's password with the reset token, use `ws.confirmReset(token, new_password)`.

```js
ws.confirmReset('b3be3e47430162407fba091945978767', ).on('success, function() {
  // Password was changed. You should login now.
});
```

{{note "This does not log in the given user after a successful password reset."}}

{{jsEvents 'success.ok' 'error.badrequest.notfound' 'complete'}}
