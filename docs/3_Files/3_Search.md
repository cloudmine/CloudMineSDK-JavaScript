# Searching for Files

Searching for objects uses a custom query syntax where:

* Conditions for an object are given within brackets, e.g. `[propertyName = "value"]`
* Equality ( `=` ) or inequality ( `!=` ) apply to numbers and strings
* Greater than ( `>` ), less than ( `<` ), greater than or equal to ( `>=` ) and less than or equal to ( `<=` ) apply only to numbers
* Conditions may be 'and' ( `,` ) or 'or' ( `or` ) for field comparisons, **but not both**
* The `near` operator must have a [geolocation field](#/javascript#geolocation-tag-objects) preceding it, followed by a reference point, e.g. `[objLocation near (-20.204, 20.302)] `
The `near` operator can have a distance field to limit results near that point, e.g. `[objLocation near (-20.204, 20.302), 10.5mi]`
* Fields in nested objects are accessed using dot-notation, e.g. `field.innerField[name = "Joe"]`

{{note 'More information on the search query syntax can be found on the REST API documentation.'}}

To search for files in your application, use `ws.searchFiles(query)`.

```js
ws.searchFiles('[content_type = "image/png"]').on('success', function(data, response) {
  console.log(data);
  // All uploaded png images
});
```

To search for all JPEG files near a given location:

```js
// Assuming we have various kinds of images
// The location property was associated to the file after upload.
var query = '[content_type = "image/jpeg", location near (10.230, 12.345), 20mi]';
ws.searchFiles(query).on('success', function(data, response) {
  console.log(data);
  // All jpeg images 20 miles from the given location
});
```

{{note 'The syntax used here is the same as [searching for objects](#/javascript#searching-for-objects) and [searching for users](#/javascript#search-for-users-in-application).'}}

{{jsEvents 'success.ok' 'error.unauthorized.notfound' 'complete'}}
