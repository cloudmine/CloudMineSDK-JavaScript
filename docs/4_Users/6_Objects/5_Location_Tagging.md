# Geolocation Tag User Objects
You can give an object a special `__geopoint__` object that can be searched for later in terms of proximity.

### Structure

```json
{
  __type__: 'geopoint',
  longitude: 45.5,
  latitude: -70.2
}
```

Suppose you have an object representing the Empire State Building.

```js
// Assume the ws object is a WebService instance with a logged in user.
ws.set('CNTower', {
  name: 'CN Tower',
  location: {
    __type__: 'geopoint',
    longitude: 43.642621,
    latitude: -79.386778
  }
});
```

### Searching For Geotags

Now let's say you have another pair of coordinates, `(43.5, -79.5)`, and you want to search for objects in your application that have been tagged within 500 miles.

```js
ws.search('[location near (43.5, -79.5), 500mi]').on('success', function(data, response) {
  console.log(data);
  // {
  //   CNTower:  {
  //    ... (full object returned)
  //   }
  // }
});
```

{{jsEvents 'success.ok' 'error.unauthorized.notfound' 'complete'}}
