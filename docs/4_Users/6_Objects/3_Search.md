# Searching for User Objects

Searching for objects uses a custom query syntax where:

* Conditions for an object are given within brackets, e.g. `[propertyName = "value"]`
* Equality ( `=` ) or inequality ( `!=` ) apply to numbers and strings
* Greater than ( `>` ), less than ( `<` ), greater than or equal to ( `>=` ) and less than or equal to ( `<=` ) apply only to numbers
* Conditions may be 'and' ( `,` ) or 'or' ( `or` ) for field comparisons, **but not both**
* The `near` operator must have a [geolocation field](#/javascript#geolocation-tag-user-objects) preceding it, followed by a reference point, e.g. `[objLocation near (-20.204, 20.302)] `
The `near` operator can have a distance field to limit results near that point, e.g. `[objLocation near (-20.204, 20.302), 10.5mi]`
* Fields in nested objects are accessed using dot-notation, e.g. `field.innerField[name = "Joe"]`

{{note 'More information on the search query syntax can be found on the REST API documentation.'}}

To search for objects in the logged in user's data, use `ws.search(query)`.

```js
// Assuming the ws object is a WebService instance with a logged in user
// and we have objects of when movies came out, categories, and their titles.
ws.search('[year > 1999, category = "horror"]').on('success', function(data, response) {
  console.log(data);
  // All horror movies that came out after the year 2000 that the user created.
});
```

To search application objects while using a logged in WebService instance:

```js
ws.search('[category = "horror"]', {applevel: true}).on(function(data, response) {
  console.log(data);
  // Contents of data contains all application objects.
});
```

```js
// Assume you have dealership objects with this structure:
// {
//   name: "Joe's auto",
//   front: [
//     {
//       year: 2012,
//       make: "Hyundai",
//       model: "Elantra"
//     }
//   ],
//   showroom: [
//     {
//       year: 2013,
//       make: "Toyota",
//       model: "Corolla"
//     },
//     {
//       year: 2013,
//       make: "Honda",
//       model: "Civic"
//     }
//   ]
// }

ws.search('showroom[make = "Honda" or make = "Toyota"]').on('success', function(data, response) {
  console.log(data);
  // All Hondas and Toyotas in the the Show room
});
```

{{note "The syntax used here is the same as searching for files and searching for users."}}

{{jsEvents 'success.ok' 'error.unauthorized.notfound' 'complete'}}
