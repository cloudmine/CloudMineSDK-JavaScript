# Geolocation Tag Objects

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
ws.set('EmpireStateBuilding', {
  name: 'Empire State Building',
  location: {
    __type__: 'geopoint',
    longitude: 40.748,
    latitude: -73.984
  }
});
```

### Searching For Geotags

Now let's say you have another pair of coordinates, `(41.128, -74.83)`, and you want to search for objects in your application that have been tagged within 500 miles.

```js
ws.search('[location near (41.128, -74.83), 500mi]').on('success', function(data, response) {
  console.log(data);
  // {
  //   EmpireStateBuilding:  {
  //    ... (full object returned)
  //   }
  // }
});
```

{{jsEvents 'success.ok' 'error.unauthorized.notfound' 'complete'}}
