# Search for Users in Application

Searching for objects uses a custom query syntax where:

* Conditions for an object are given within brackets, e.g. `[propertyName = "value"]`
* Equality ( `=` ) or inequality ( `!=` ) apply to numbers and strings
* Greater than ( `>` ), less than ( `<` ), greater than or equal to ( `>=` ) and less than or equal to ( `<=` ) apply only to numbers
* Conditions may be 'and' ( `,` ) or 'or' ( `or` ) for field comparisons, **but not both**
* The `near` operator must have a [geolocation field](#/javascript#geolocation-tag-objects) preceding it, followed by a reference point, e.g. `[objLocation near (-20.204, 20.302)] `
The `near` operator can have a distance field to limit results near that point, e.g. `[objLocation near (-20.204, 20.302), 10.5mi]`
* Fields in nested objects are accessed using dot-notation, e.g. `field.innerField[name = "Joe"]`

{{note 'More information on the search query syntax can be found on the REST API documentation.'}}

To search for users in your application, use `ws.searchUsers(query)`.

```js
ws.searchUsers('[favoriteColor = "blue"]').on('success', function(data, response) {
  console.log(data);
  // All users who have the favoriteColor attribute defined as "blue"
});
```

```js
// Assuming we have various kinds of images
ws.searchUsers('[favoriteColor = "blue", favoriteAnimal = "dog"]').on('success', function(data, response) {
  console.log(data);
  // All users that like the color blue and their favorite animal is dogs.
  //  oOOo
  //  (__) 
});
```

{{note "The syntax used here is the same as searching for objects and searching for files."}}

{{jsEvents 'success.ok' 'error.unauthorized.notfound' 'complete'}}
