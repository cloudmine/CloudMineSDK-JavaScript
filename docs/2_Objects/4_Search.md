# Searching for Objects

Searching for objects uses a custom query syntax where:

* Conditions for an object are given within brackets, e.g. `[propertyName = "value"]`
* Equality ( `=` ) or inequality ( `!=` ) apply to numbers and strings
* Greater than ( `>` ), less than ( `<` ), greater than or equal to ( `>=` ) and less than or equal to ( `<=` ) apply only to numbers
* Conditions may be 'and' ( `,` ) or 'or' ( `or` ) for field comparisons, **but not both**
* The `near` operator must have a [geolocation field](#/javascript#geolocation-tag-objects) preceding it, followed by a reference point, e.g. `[objLocation near (-20.204, 20.302)] `
The `near` operator can have a distance field to limit results near that point, e.g. `[objLocation near (-20.204, 20.302), 10.5mi]`
* Fields in nested objects are accessed using dot-notation, e.g. `field.innerField[name = "Joe"]`

{{note 'More information on the search query syntax can be found on the REST API documentation.'}}

To search for objects in the application, use `ws.search(query)`:

```js
// Assuming we have car objects saved with their manufacture year
ws.search('[year > 1999, make = "Honda"]').on('success', function(data, response) {
  console.log(data);
  // All Hondas made since Y2K
});
```

To search nested objects:

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


