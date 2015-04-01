# Saving Objects

Save a single object with `ws.set(key, value)`. The key parameter is a unique identifier for the object and the object or other value you wish to save is the value parameter.

```js
ws.set('car', {
  color: 'red',
  make: 'Porsche'
}).on('success', function(data, response) {
  console.log(data);
  // { car: 'created' }
});
```

{{note "Use `null` as a key if you would like to assign a randomly generated id."}}

Multiple objects can be saved at once by passing an object of key-value pairs using `ws.set(object).`

```js
ws.set({
  'car1': {
    color: 'red',
    make: 'Porsche'
  },
  'car2': {
    color: 'red',
    make: 'Ferrari'
  },
  'car3': {
    color: 'black',
    make: 'Audi'
  },
}).on('success', function(data, response) { 
  console.log(data);
  // {
  //   car1: 'created',
  //   car2: 'created',
  //   car3: 'created'
  // }
});
```

{{caution "`ws.set` **will overwrite the given key if an object under that key already exists.**<br /><br />Use `ws.update` to change only certain values of an existing object."}}

{{jsEvents 'success.ok' 'error.unauthorized.notfound' 'complete'}}
