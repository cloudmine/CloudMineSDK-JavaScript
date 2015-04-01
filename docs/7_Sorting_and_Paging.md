# Sorting and Paging

## Sorting

Fetch Application Objects, Search Application Objects, Search Application Files, Fetch User Objects, Search User Objects, Search User Files, Search Users and User List have sorting support.

By default, objects are returned in an undefined (and not always consistent) order. You can specify one or more fields to sort by passing it as a web service option. WebService options are passed as the last argument to any of the WebService calls.

```js
ws.get({sort: 'firstName'}).on('success', function(data, response) {
  console.log(data);
  // This will retrieve all objects sorted by the firstName field on the
  // object, if present.
});
```

You can also specify sort order on a per-field basis. By default, objects are ordered in ascending order. Given the previous example, to sort firstName in descending order:

```js
ws.get({sort: 'firstName:desc'}).on('success', function(data, response) {
  console.log(data);
  // This will retrieve all objects sorted by the firstName field on the object
  // in descending order, if present.
});
```

## Paging

Fetch Application Objects, Search Application Objects, Search Application Files, Fetch User Objects, Search User Objects, Search User Files, Search Users, and User List have paging support.

By default requests have a limit of 50 results. To change this behavior and access further results, there are two WebService options available: `limit` and `skip`.

To see how many results occur with a call, simply refer to the `response` argument that is present in any result event.

```js
ws.get({limit: 20, skip: 20, count: true}).on('success', function(data, response) {
  console.log(data);
  // This will get objects 20 - 39 of all application objects (starting from 0).
  // response.count will contain the count of all objects.
});
```

{{note "By default, count is included in all WebService calls. It is not recommended to change the count WebService option from the default value."}}

If you only want to count results from a WebService call, use:

* limit
  * Limits the number of results returned to the specfied integer. Use -1 for no limit. Use 0 for no results, and with count=true to just get the number of available results.
  * Default: **50**
* skip
  * Start results after skipping the specified number objects. Must be an integer greater than or equal to 0.
  * Default: **0**
* count
  * Include a count of the total result set for the query, regardless of values for limit or skip. Valid values are true and false.
  * Default: **false**


