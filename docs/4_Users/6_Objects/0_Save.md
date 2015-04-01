# Saving User Objects

Save a single object with `ws.set(key, value)`. The key parameter is a unique identifier for the object and the object or other value you wish to save is the value parameter.

```js
// Assuming your ws WebService instance was used to login a user
var myCar = {
  color: 'red',
  year: 2012,
  make: 'Mazda',
  model: 'Protogé'
};
 
ws.set('car', myCar).on('success', function(data, response) {
  // Note: this will create the 'car' object in the user account, not the application.
  console.log(data);
  // { car: 'created' }
});
```

To save application objects while using a logged in WebService instance:

```js
ws.set('car2', myCar, { applevel: true }).on('success', function(data, response) {
  // This object was created in the application, not the logged in user.
});
```

{{note "Use `null` as a key if you would like to assign a randomly generated id."}}

Multiple objects can be saved at once by passing an object of key-value pairs using `ws.set(object)`.

```js
ws.set({
  'myCat': {
    name: 'Moki',
    age: 2
  },
  'friendsCat': {
    name: 'Pan',
    age: 3
  }
}).on('success', function(data, response) {
  console.log(data);
  // { myCat: 'created', friendsCat: 'created' }
});
```

{{caution "`ws.set` will overwrite the given key if an object under that key already exists.<br /><br />Use `ws.update` to change only certain values of an existing object."}}

{{jsEvents 'success.ok' 'error.unauthorized.notfound' 'complete'}}
