# Send Push Notification

CloudMine supports sending a push notification to all users, or a subset of users.

{{note "Your API key must have push notification support enabled to send notifications."}}

```js
var notification = {
    text: "Hello world!"
    /* other fields, see below... */
};

ws.pushNotification(notification).on('success', function(data, response) {
  console.log(data);
});
```

The full specification of the notification object consists of:

```js
{
    text: "Message",         // the message to send
    channel: "Channel Name", // channel to push to
    users: [                 // list of specific users
        "4d81718682b64e42a39b6c6606397821",
        { email: "user@example.com" },
        { username: "username" }
    ],
    device_ids: [            // list of specific device ids
        "af335982e1cb4db59467735628ed0e8d",
        "9d6773870c0d41fd91e28def2b36adbe",
        "db14b23789e6404a9a739f2f930547e1"
    ],
    badge: 3,                // badge to display in app icon (iOS only)
    sound: "sound1.aiff",    // sound to play (iOS only)
    payload: {               // a place to include extra data (iOS only)
        "specialid": 15732,
        "specialshape": {
            "moredata": "data",
            "moredataid": 432,
            "action": "route_to_account_info"
        }
    }
}
```

The only required field is `text`. All other fields are optional. Notifications will be sent to all specified targets. If `channel`, `users`, and `device_ids` are all omitted, the notification will be dispatched to **all** users of your app.

{{jsEvents 'success.ok' 'error.unauthorized.notfound' 'complete'}}
